import uuid
from datetime import datetime
from typing import Dict, Optional

from models import TrainingSession, SessionStatus, FeatureType


class TrainingManager:
    """Manages all active training sessions."""

    def __init__(self):
        self.sessions: Dict[str, TrainingSession] = {}

    def create_session(self, feature_type: str, dataset_id: str,
                       hyperparameters: Optional[Dict] = None) -> str:
        session_id = str(uuid.uuid4())

        try:
            ft = FeatureType(feature_type)
        except ValueError:
            ft = FeatureType.WATCH_LEARN

        session = TrainingSession(
            session_id=session_id,
            feature_type=ft,
            dataset_name=dataset_id,
        )

        if hyperparameters:
            # Apply model size configuration
            model_size = hyperparameters.get('model_size', 'medium')
            model_size_configs = {
                'small': {'n_embd': 32, 'n_layer': 3, 'n_head': 3, 'block_size': 96},
                'medium': {'n_embd': 64, 'n_layer': 4, 'n_head': 4, 'block_size': 128},
                'large': {'n_embd': 96, 'n_layer': 6, 'n_head': 6, 'block_size': 256},
            }
            if model_size in model_size_configs:
                for key, value in model_size_configs[model_size].items():
                    session.model_config[key] = value

            # Apply training hyperparameters
            for key in ('batch_size', 'max_iters', 'learning_rate', 'eval_interval'):
                if key in hyperparameters:
                    session.training_config[key] = hyperparameters[key]

        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[TrainingSession]:
        return self.sessions.get(session_id)

    def start_training(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        session.status = SessionStatus.RUNNING
        session.started_at = datetime.now()
        return True

    def pause_training(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session or session.status != SessionStatus.RUNNING:
            return False
        session.status = SessionStatus.PAUSED
        return True

    def resume_training(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session or session.status != SessionStatus.PAUSED:
            return False
        session.status = SessionStatus.RUNNING
        return True

    def stop_training(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        session.status = SessionStatus.STOPPED
        return True

    def set_speed(self, session_id: str, speed_multiplier: float) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        session.speed_multiplier = float(speed_multiplier)
        return True

    def cleanup_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def get_all_sessions(self) -> Dict[str, Dict]:
        result = {}
        for sid, session in self.sessions.items():
            result[sid] = {
                'session_id': sid,
                'feature_type': session.feature_type.value,
                'status': session.status.value,
                'current_iter': session.current_iter,
                'max_iters': session.training_config.get('max_iters', 500),
            }
        return result
