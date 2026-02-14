"""
checkpoint_manager.py — Save/load model checkpoints and manage the registry.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

import torch

CHECKPOINTS_DIR = os.path.join(os.path.dirname(__file__), 'checkpoints')
REGISTRY_PATH   = os.path.join(CHECKPOINTS_DIR, 'models_registry.json')


def _ensure_dir():
    os.makedirs(CHECKPOINTS_DIR, exist_ok=True)


def load_registry() -> List[Dict]:
    _ensure_dir()
    if not os.path.exists(REGISTRY_PATH):
        return []
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)


def _save_registry(records: List[Dict]):
    _ensure_dir()
    with open(REGISTRY_PATH, 'w') as f:
        json.dump(records, f, indent=2)


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

    torch.save({
        'model_state':     model.state_dict(),
        'optimizer_state': optimizer.state_dict(),
        'model_config':    model_config,
        'training_config': training_config,
        'step':            step,
        'train_loss':      train_loss,
    }, filepath)

    entry = {
        'id':           record_id,
        'name':         name,
        'feature_type': feature_type,
        'filename':     filename,
        'step':         step,
        'train_loss':   train_loss,
        'created_at':   datetime.utcnow().isoformat() + 'Z',
    }

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
    return torch.load(filepath, map_location='cpu', weights_only=False)


def rename_checkpoint(record_id: str, new_name: str) -> bool:
    records = load_registry()
    for r in records:
        if r['id'] == record_id:
            r['name'] = new_name
            _save_registry(records)
            return True
    return False


def delete_checkpoint(record_id: str) -> bool:
    records = load_registry()
    entry   = next((r for r in records if r['id'] == record_id), None)
    if not entry:
        return False
    filepath = os.path.join(CHECKPOINTS_DIR, entry['filename'])
    if os.path.exists(filepath):
        os.remove(filepath)
    _save_registry([r for r in records if r['id'] != record_id])
    return True
