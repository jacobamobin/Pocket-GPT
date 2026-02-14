from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum


class SessionStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    COMPLETED = "completed"
    ERROR = "error"


class FeatureType(Enum):
    WATCH_LEARN = "watch_learn"
    ATTENTION_CINEMA = "attention_cinema"
    STYLE_TRANSFER = "style_transfer"


@dataclass
class TrainingSession:
    """Represents a single model training session."""

    # Identity
    session_id: str
    feature_type: FeatureType
    status: SessionStatus = SessionStatus.IDLE

    # Model configuration - larger defaults for better learning
    model_config: Dict = field(default_factory=lambda: {
        'vocab_size': 65,
        'n_embd': 64,         # Increased from 16
        'n_layer': 4,          # Increased from 2
        'n_head': 4,           # Increased from 2
        'block_size': 128,      # Increased from 64
        'dropout': 0.0,
        'bias': False,
        'weight_tying': True,
    })

    # Training configuration - more iterations for actual learning
    training_config: Dict = field(default_factory=lambda: {
        'batch_size': 64,       # Increased from 32
        'max_iters': 5000,      # Increased from 500
        'learning_rate': 1e-3,
        'eval_interval': 100,    # Increased for efficiency
        'warmup_steps': 100,     # Increased
        'lr_decay': 'cosine',
        'grad_clip': 1.0,
        'temperature': 0.8,      # New: control generation randomness
    })

    # Dataset
    dataset_name: str = ""
    dataset_path: str = ""
    text_corpus: str = ""
    vocab: List[str] = field(default_factory=list)
    char_to_idx: Dict[str, int] = field(default_factory=dict)
    idx_to_char: Dict[int, str] = field(default_factory=dict)

    # Runtime state
    current_iter: int = 0
    speed_multiplier: float = 1.0
    model_instance: Optional[object] = None
    optimizer: Optional[object] = None

    # Metrics history
    loss_history: List[Dict] = field(default_factory=list)
    attention_snapshots: List[Dict] = field(default_factory=list)
    generated_samples: List[Dict] = field(default_factory=list)

    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Error tracking
    error_message: Optional[str] = None
