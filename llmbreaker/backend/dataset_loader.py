"""
Dataset loader: character-level tokenisation, train/val split, batch generation.

This module is used by trainer.py and directly by app.py when preparing a
session's corpus.  A full version with file-upload / .docx support lives here
too (anticipating Phase 5 tasks), but the training loop only depends on:

    load_text(text_or_path)  →  text: str
    build_vocab(text)        →  char_to_idx, idx_to_char
    encode / decode
    get_batch(...)           →  (x, y) torch tensors
"""

import os
import random
import torch
from typing import Dict, List, Tuple


# ---------------------------------------------------------------------------
# Vocabulary helpers
# ---------------------------------------------------------------------------

def build_vocab(text: str) -> Tuple[List[str], Dict[str, int], Dict[int, str]]:
    """
    Build character-level vocabulary from text.

    Returns:
        vocab        – sorted list of unique characters
        char_to_idx  – char → int
        idx_to_char  – int  → char
    """
    vocab = sorted(set(text))
    char_to_idx = {ch: i for i, ch in enumerate(vocab)}
    idx_to_char = {i: ch for i, ch in enumerate(vocab)}
    return vocab, char_to_idx, idx_to_char


def encode(text: str, char_to_idx: Dict[str, int]) -> List[int]:
    """Map each character to its index; skip unknown chars."""
    return [char_to_idx[ch] for ch in text if ch in char_to_idx]


def decode(indices: List[int], idx_to_char: Dict[int, str]) -> str:
    """Map indices back to a string."""
    return ''.join(idx_to_char.get(i, '') for i in indices)


# ---------------------------------------------------------------------------
# Dataset loading
# ---------------------------------------------------------------------------

def load_text_from_file(path: str) -> str:
    """Load plain text from a .txt file."""
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()


def load_text_from_docx(path: str) -> str:
    """Extract text from a .docx file using python-docx."""
    from docx import Document
    doc = Document(path)
    return '\n'.join(p.text for p in doc.paragraphs)


def load_dataset(
    name: str,
    datasets_dir: str,
) -> str:
    """Load a pre-bundled dataset by name (shakespeare / poems / childrens)."""
    filename_map = {
        'shakespeare': 'shakespeare.txt',
        'poems':       'poems.txt',
        'childrens':   'childrens.txt',
    }
    filename = filename_map.get(name)
    if filename is None:
        raise ValueError(f'Unknown dataset: {name}')
    path = os.path.join(datasets_dir, filename)
    return load_text_from_file(path)


def load_from_file(path: str) -> str:
    """Load user-uploaded file (.txt or .docx)."""
    ext = path.rsplit('.', 1)[-1].lower()
    if ext == 'docx':
        return load_text_from_docx(path)
    return load_text_from_file(path)


def dataset_metadata(text: str) -> Dict:
    """Return char_count, word_count, vocab_size for a text corpus."""
    return {
        'char_count':  len(text),
        'word_count':  len(text.split()),
        'vocab_size':  len(set(text)),
    }


# ---------------------------------------------------------------------------
# Train / val split
# ---------------------------------------------------------------------------

def train_val_split(
    encoded: List[int],
    val_fraction: float = 0.1,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Split encoded data into train and val tensors (90/10 by default)."""
    n = int(len(encoded) * (1.0 - val_fraction))
    train_data = torch.tensor(encoded[:n], dtype=torch.long)
    val_data   = torch.tensor(encoded[n:], dtype=torch.long)
    return train_data, val_data


# ---------------------------------------------------------------------------
# Batch generation
# ---------------------------------------------------------------------------

def get_batch(
    data: torch.Tensor,
    block_size: int,
    batch_size: int,
    device: torch.device,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Sample a random batch of (input, target) pairs.

    Each target is the input shifted one position to the right.
    """
    n = len(data) - block_size
    if n <= 0:
        raise ValueError(
            f'Dataset too short ({len(data)} tokens) for block_size={block_size}. '
            f'Need at least {block_size + 1} tokens.'
        )
    ix = torch.randint(n, (batch_size,))
    x  = torch.stack([data[i    : i + block_size    ] for i in ix])
    y  = torch.stack([data[i + 1: i + block_size + 1] for i in ix])
    return x.to(device), y.to(device)


# ---------------------------------------------------------------------------
# Prepare a full dataset for a training session
# ---------------------------------------------------------------------------

def prepare_dataset(
    text: str,
    block_size: int = 64,
    val_fraction: float = 0.1,
) -> Dict:
    """
    Full pipeline: text → vocab → encoded → train/val split.

    Returns a dict with everything the trainer needs.
    """
    vocab, char_to_idx, idx_to_char = build_vocab(text)
    encoded = encode(text, char_to_idx)
    train_data, val_data = train_val_split(encoded, val_fraction)
    return {
        'vocab':        vocab,
        'char_to_idx':  char_to_idx,
        'idx_to_char':  idx_to_char,
        'vocab_size':   len(vocab),
        'train_data':   train_data,
        'val_data':     val_data,
        'char_count':   len(text),
        'word_count':   len(text.split()),
    }
