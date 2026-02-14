"""
checkpoint_manager.py — Save/load model checkpoints and manage the registry.
"""

import json
import os
import tempfile
import threading
import uuid
from datetime import datetime
from typing import Dict, List, Optional

import torch

CHECKPOINTS_DIR = os.path.join(os.path.dirname(__file__), 'checkpoints')
REGISTRY_PATH   = os.path.join(CHECKPOINTS_DIR, 'models_registry.json')

_registry_lock = threading.Lock()


def _ensure_dir():
    os.makedirs(CHECKPOINTS_DIR, exist_ok=True)


def load_registry() -> List[Dict]:
    _ensure_dir()
    if not os.path.exists(REGISTRY_PATH):
        return []
    try:
        with open(REGISTRY_PATH, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _save_registry(records: List[Dict]):
    _ensure_dir()
    fd, tmp = tempfile.mkstemp(dir=CHECKPOINTS_DIR, suffix='.json')
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(records, f, indent=2)
        os.replace(tmp, REGISTRY_PATH)
    except Exception:
        os.unlink(tmp)
        raise


def save_checkpoint(
    model,
    optimizer,
    model_config: dict,
    training_config: dict,
    feature_type: str,
    step: int,
    train_loss: Optional[float],
    name: str,
) -> Dict:
    """
    Serialise model + optimizer to disk and record in registry.
    Returns the registry entry dict.
    """
    _ensure_dir()
    record_id  = str(uuid.uuid4())
    filename   = f"{record_id}.pt"
    filepath   = os.path.join(CHECKPOINTS_DIR, filename)

    model_state = {k: v.cpu() for k, v in model.state_dict().items()}
    optimizer_state = optimizer.state_dict()

    try:
        torch.save({
            'model_state':     model_state,
            'optimizer_state': optimizer_state,
            'model_config':    model_config,
            'training_config': training_config,
            'step':            step,
            'train_loss':      train_loss,
        }, filepath)
    except Exception as e:
        raise RuntimeError(f"Failed to save checkpoint: {e}") from e

    entry = {
        'id':           record_id,
        'name':         name,
        'feature_type': feature_type,
        'filename':     filename,
        'step':         step,
        'train_loss':   train_loss,
        'created_at':   datetime.utcnow().isoformat() + 'Z',
    }

    with _registry_lock:
        records = load_registry()
        records.append(entry)
        _save_registry(records)
    return entry


def load_checkpoint(record_id: str) -> Optional[Dict]:
    """
    Returns the full checkpoint dict (model_state, optimizer_state, configs, step).
    Returns None if not found.
    """
    records = load_registry()
    entry   = next((r for r in records if r['id'] == record_id), None)
    if not entry:
        return None
    filepath = os.path.join(CHECKPOINTS_DIR, entry['filename'])
    if not os.path.exists(filepath):
        return None
    try:
        return torch.load(filepath, map_location='cpu', weights_only=False)
    except Exception as e:
        return None  # corrupt or incompatible checkpoint


def rename_checkpoint(record_id: str, new_name: str) -> bool:
    with _registry_lock:
        records = load_registry()
        for r in records:
            if r['id'] == record_id:
                r['name'] = new_name
                _save_registry(records)
                return True
    return False


def delete_checkpoint(record_id: str) -> bool:
    with _registry_lock:
        records = load_registry()
        entry   = next((r for r in records if r['id'] == record_id), None)
        if not entry:
            return False
        filepath = os.path.join(CHECKPOINTS_DIR, entry['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        _save_registry([r for r in records if r['id'] != record_id])
    return True
