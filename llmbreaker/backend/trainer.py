"""
trainer.py — Real MicroGPT training loop.

Run as a Socket.IO background task (socketio.start_background_task).
Replaces the stub loop in app.py.
"""

import math
import torch
import torch.nn as nn

from models import SessionStatus, TrainingSession
from micro_gpt import MicroGPT
from dataset_loader import (
    prepare_dataset,
    load_dataset,
    load_from_file,
    get_batch,
    decode,
)
from metrics_emitter import (
    emit_training_metrics,
    emit_generated_sample,
    emit_attention_snapshot,
    emit_error,
)

# Path to pre-bundled datasets directory (set by app.py before first use)
DATASETS_DIR: str = ''


# ---------------------------------------------------------------------------
# Learning-rate schedule
# ---------------------------------------------------------------------------

def _get_lr(step: int, warmup_steps: int, max_iters: int, lr: float) -> float:
    """
    Cosine decay with linear warmup.

    - Steps 0 … warmup_steps: linear ramp 0 → lr
    - Steps warmup_steps … max_iters: cosine decay lr → lr/10
    """
    if step < warmup_steps:
        return lr * (step + 1) / warmup_steps
    if step >= max_iters:
        return lr / 10.0
    progress = (step - warmup_steps) / max(1, max_iters - warmup_steps)
    cosine   = 0.5 * (1.0 + math.cos(math.pi * progress))
    return lr / 10.0 + cosine * (lr - lr / 10.0)


# ---------------------------------------------------------------------------
# Loss estimation (no-grad, runs on train and val splits)
# ---------------------------------------------------------------------------

@torch.no_grad()
def _estimate_loss(
    model: MicroGPT,
    train_data: torch.Tensor,
    val_data:   torch.Tensor,
    block_size: int,
    batch_size: int,
    eval_iters: int,
    device:     torch.device,
) -> tuple[float, float]:
    model.eval()
    losses = {}
    for split, data in (('train', train_data), ('val', val_data)):
        total = 0.0
        iters = min(eval_iters, max(1, (len(data) - block_size) // batch_size))
        for _ in range(iters):
            x, y = get_batch(data, block_size, batch_size, device)
            _, loss = model(x, y)
            total += loss.item()
        losses[split] = total / iters
    model.train()
    return losses['train'], losses['val']


# ---------------------------------------------------------------------------
# Main training entry point
# ---------------------------------------------------------------------------

def run_training(session: TrainingSession, socketio) -> None:
    """
    Full training loop for one session.  Called as a background task.

    Reads all config from `session`, emits events via `socketio`.
    """
    session_id = session.session_id

    # ── 1. Load / prepare dataset ──────────────────────────────────────────
    try:
        if session.text_corpus:
            text = session.text_corpus
        elif session.dataset_path:
            text = load_from_file(session.dataset_path)
        else:
            text = load_dataset(session.dataset_name, DATASETS_DIR)
    except Exception as e:
        session.status = SessionStatus.ERROR
        session.error_message = str(e)
        emit_error(socketio, session_id, 'dataset_load_error', str(e))
        return

    try:
        ds = prepare_dataset(text, block_size=session.model_config['block_size'])
    except Exception as e:
        session.status = SessionStatus.ERROR
        session.error_message = str(e)
        emit_error(socketio, session_id, 'dataset_prepare_error', str(e))
        return

    # Persist vocab info on the session (used by later phases)
    session.vocab       = ds['vocab']
    session.char_to_idx = ds['char_to_idx']
    session.idx_to_char = ds['idx_to_char']
    session.model_config['vocab_size'] = ds['vocab_size']

    train_data = ds['train_data']
    val_data   = ds['val_data']

    # ── 2. Build model & optimiser ─────────────────────────────────────────
    device = torch.device('cpu')

    try:
        model = MicroGPT(session.model_config).to(device)
        session.model_instance = model
    except Exception as e:
        session.status = SessionStatus.ERROR
        session.error_message = str(e)
        emit_error(socketio, session_id, 'model_init_error', str(e))
        return

    tc            = session.training_config
    max_iters     = tc.get('max_iters',     500)
    batch_size    = tc.get('batch_size',     32)
    block_size    = session.model_config['block_size']
    eval_interval = tc.get('eval_interval',  50)
    lr            = tc.get('learning_rate', 1e-3)
    warmup_steps  = tc.get('warmup_steps',   50)
    grad_clip     = tc.get('grad_clip',      1.0)
    eval_iters    = 20   # how many batches to average when estimating loss

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.0)
    session.optimizer = optimizer

    # ── 3. Training loop ───────────────────────────────────────────────────
    model.train()

    for step in range(session.current_iter, max_iters):

        # ── pause / stop checks ──
        while session.status == SessionStatus.PAUSED:
            if getattr(session, '_step_once', False):
                session._step_once = False
                break
            socketio.sleep(0.05)

        if session.status in (SessionStatus.STOPPED, SessionStatus.ERROR):
            return

        session.current_iter = step + 1

        # ── learning-rate update ──
        current_lr = _get_lr(step, warmup_steps, max_iters, lr)
        for pg in optimizer.param_groups:
            pg['lr'] = current_lr

        # ── forward + backward ──
        x, y = get_batch(train_data, block_size, batch_size, device)
        _, loss = model(x, y)

        optimizer.zero_grad(set_to_none=True)
        loss.backward()

        if grad_clip > 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), grad_clip)

        optimizer.step()

        # ── eval + emit every eval_interval steps (and on step 1) ──
        if (step + 1) % eval_interval == 0 or step == 0:
            train_loss, val_loss = _estimate_loss(
                model, train_data, val_data,
                block_size, batch_size, eval_iters, device,
            )

            # Store in session history
            record = {
                'step':       step + 1,
                'train_loss': round(train_loss, 4),
                'val_loss':   round(val_loss,   4),
            }
            session.loss_history.append(record)

            # Emit loss metrics
            emit_training_metrics(
                socketio, session_id,
                step + 1, train_loss, val_loss,
            )

            # Generate a text sample
            sample_text = _generate_sample(model, ds['idx_to_char'], device)
            sample_record = {
                'step':   step + 1,
                'text':   sample_text,
                'prompt': '',
            }
            session.generated_samples.append(sample_record)
            emit_generated_sample(
                socketio, session_id,
                step + 1, sample_text,
            )

            # Extract and emit attention snapshots
            _emit_attention(
                socketio, session_id, model, step + 1,
                x, ds['idx_to_char'],
            )

        # ── speed-aware sleep ──
        speed = max(session.speed_multiplier, 0.1)
        # At 1× we yield briefly so the event loop can breathe.
        # At 10× we skip the yield entirely (max throughput).
        if speed < 10.0:
            socketio.sleep(0.01 / speed)
        else:
            socketio.sleep(0)

    # ── 4. Completion ──────────────────────────────────────────────────────
    from datetime import datetime

    session.status       = SessionStatus.COMPLETED
    session.completed_at = datetime.now()

    final = session.loss_history[-1] if session.loss_history else {}
    elapsed = (
        round((session.completed_at - session.started_at).total_seconds(), 2)
        if session.started_at else None
    )

    from datetime import timezone
    import time as _time

    socketio.emit('training_completed', {
        'session_id':        session_id,
        'final_train_loss':  final.get('train_loss'),
        'final_val_loss':    final.get('val_loss'),
        'total_time_seconds': elapsed,
        'timestamp':         int(datetime.now(timezone.utc).timestamp()),
    }, room=session_id)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_sample(
    model: MicroGPT,
    idx_to_char: dict,
    device: torch.device,
    max_new_tokens: int = 80,
    temperature: float = 0.8,
) -> str:
    """Generate a short text sample from the current model weights."""
    model.eval()
    seed = torch.zeros((1, 1), dtype=torch.long, device=device)
    with torch.no_grad():
        out = model.generate(seed, max_new_tokens=max_new_tokens,
                             temperature=temperature)
    model.train()
    tokens = out[0].tolist()
    return decode(tokens, idx_to_char)


def _emit_attention(
    socketio,
    session_id: str,
    model: MicroGPT,
    step: int,
    x: torch.Tensor,
    idx_to_char: dict,
) -> None:
    """
    Run one forward pass in eval mode to capture attention weights,
    then emit one snapshot per (layer, head).
    """
    model.eval()
    with torch.no_grad():
        model(x[:1])   # single example, populates last_attention on every Head
    model.train()

    # Decode the token context used (first example, first block_size tokens)
    token_indices = x[0].tolist()
    tokens = [idx_to_char.get(i, '?') for i in token_indices]

    for snap in model.extract_attention_weights():
        emit_attention_snapshot(
            socketio,
            session_id   = session_id,
            step         = step,
            layer        = snap['layer'],
            head         = snap['head'],
            matrix       = snap['matrix'],
            tokens       = tokens,
        )
