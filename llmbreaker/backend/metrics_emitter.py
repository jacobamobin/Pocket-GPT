"""
Metrics emitter: converts model outputs → JSON and emits via Socket.IO.

All emission goes through this module so throttling and serialisation
stay in one place.  The socketio instance is passed in at call time to
avoid circular imports.
"""

import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _ts() -> int:
    return int(datetime.now(timezone.utc).timestamp())


# ---------------------------------------------------------------------------
# Rate limiter (max 30 emits / second across all event types)
# ---------------------------------------------------------------------------

class _RateLimiter:
    def __init__(self, max_per_second: float = 30.0):
        self._interval = 1.0 / max_per_second
        self._last     = 0.0

    def allow(self) -> bool:
        now = time.monotonic()
        if now - self._last >= self._interval:
            self._last = now
            return True
        return False


_limiter = _RateLimiter(max_per_second=30.0)


# ---------------------------------------------------------------------------
# Public emission functions
# ---------------------------------------------------------------------------

def emit_training_metrics(
    socketio: Any,
    session_id: str,
    step: int,
    train_loss: float,
    val_loss: float,
) -> None:
    """Emit loss values for the current training step."""
    payload = {
        'session_id': session_id,
        'step':        step,
        'train_loss':  round(float(train_loss), 4),
        'val_loss':    round(float(val_loss),   4),
        'timestamp':   _ts(),
    }
    socketio.emit('training_metrics', payload, room=session_id)


def emit_generated_sample(
    socketio: Any,
    session_id: str,
    step: int,
    text: str,
    prompt: str = '',
) -> None:
    """Emit a generated text sample."""
    payload = {
        'session_id': session_id,
        'step':       step,
        'text':       text,
        'prompt':     prompt,
        'timestamp':  _ts(),
    }
    socketio.emit('generated_sample', payload, room=session_id)


def emit_attention_snapshot(
    socketio: Any,
    session_id: str,
    step: int,
    layer: int,
    head: int,
    matrix: List[List[float]],
    tokens: List[str],
) -> None:
    """
    Emit one attention matrix.

    `matrix` must already be a plain Python list-of-lists (not a tensor).
    Throttled to prevent flooding the client.
    """
    if not _limiter.allow():
        return
    payload = {
        'session_id': session_id,
        'step':       step,
        'layer':      layer,
        'head':       head,
        'matrix':     matrix,
        'tokens':     tokens,
        'timestamp':  _ts(),
    }
    socketio.emit('attention_snapshot', payload, room=session_id)


def emit_error(
    socketio: Any,
    session_id: str,
    error_type: str,
    message: str,
) -> None:
    """Emit an error event to the client."""
    payload = {
        'session_id': session_id,
        'error_type': error_type,
        'message':    message,
        'timestamp':  _ts(),
    }
    socketio.emit('error', payload, room=session_id)


def emit_vocab_info(
    socketio: Any,
    session_id: str,
    vocab: List[str],
    char_to_idx: Dict[str, int],
    text_preview: str = '',
) -> None:
    """Emit vocabulary mapping once at training start."""
    payload = {
        'session_id':   session_id,
        'vocab':        vocab,
        'char_to_idx':  char_to_idx,
        'text_preview': text_preview[:500],
        'timestamp':    _ts(),
    }
    socketio.emit('vocab_info', payload, room=session_id)


def emit_embedding_snapshot(
    socketio: Any,
    session_id: str,
    step: int,
    coords: List[List[float]],
    labels: List[str],
) -> None:
    """Emit 3D-reduced embedding coordinates."""
    payload = {
        'session_id': session_id,
        'step':       step,
        'coords':     coords,
        'labels':     labels,
        'timestamp':  _ts(),
    }
    socketio.emit('embedding_snapshot', payload, room=session_id)


def emit_token_probabilities(
    socketio: Any,
    session_id: str,
    step: int,
    logits: List[float],
    generated_token: str,
    vocab: List[str],
) -> None:
    """Emit raw logits for the last generated token (frontend applies temperature)."""
    payload = {
        'session_id':      session_id,
        'step':            step,
        'logits':          logits,
        'generated_token': generated_token,
        'vocab':           vocab,
        'timestamp':       _ts(),
    }
    socketio.emit('token_probabilities', payload, room=session_id)


def emit_step_progress(
    socketio: Any,
    session_id: str,
    step: int,
) -> None:
    """
    Emit a lightweight step progress update.

    This is separate from full metrics emission to allow more frequent
    updates without the overhead of loss estimation and text generation.
    """
    payload = {
        'session_id': session_id,
        'step':       step,
        'timestamp':  _ts(),
    }
    socketio.emit('step_progress', payload, room=session_id)
