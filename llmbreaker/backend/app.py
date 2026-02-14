import eventlet
eventlet.monkey_patch()

import os
import uuid
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

from models import SessionStatus
from training_manager import TrainingManager
import trainer as _trainer

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = Flask(__name__)
app.config['SECRET_KEY'] = 'llmbreaker-dev-secret'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB

CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

manager = TrainingManager()

DATASETS_DIR = os.path.join(os.path.dirname(__file__), 'datasets')
UPLOADS_DIR  = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Give the trainer module its datasets path
_trainer.DATASETS_DIR = DATASETS_DIR

# In-memory store for user-uploaded dataset text keyed by dataset_id
user_datasets: dict = {}

ALLOWED_EXTENSIONS = {'txt', 'docx'}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _read_file_text(filepath: str) -> str:
    ext = filepath.rsplit('.', 1)[1].lower()
    if ext == 'docx':
        from docx import Document
        doc = Document(filepath)
        return '\n'.join(p.text for p in doc.paragraphs)
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()


def _dataset_metadata(text: str, name: str, display_name: str) -> dict:
    chars = set(text)
    return {
        'name': name,
        'display_name': display_name,
        'char_count': len(text),
        'vocab_size': len(chars),
        'word_count': len(text.split()),
    }


def _ts() -> int:
    return int(datetime.now(timezone.utc).timestamp())


# ---------------------------------------------------------------------------
# REST: Health
# ---------------------------------------------------------------------------

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'LLMBreaker backend running'})


# ---------------------------------------------------------------------------
# REST: Datasets
# ---------------------------------------------------------------------------

BUNDLED_DATASETS = [
    ('shakespeare', 'Shakespeare Complete Works', 'shakespeare.txt'),
    ('poems',       'Classic Poetry Collection',  'poems.txt'),
    ('childrens',   "Children's Books",            'childrens.txt'),
]


@app.route('/api/datasets', methods=['GET'])
def list_datasets():
    datasets = []
    for name, display_name, filename in BUNDLED_DATASETS:
        filepath = os.path.join(DATASETS_DIR, filename)
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            text = f.read()
        meta = _dataset_metadata(text, name, display_name)
        meta['file_path'] = f'/datasets/{filename}'
        datasets.append(meta)
    return jsonify({'datasets': datasets})


@app.route('/api/datasets/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not _allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file type. Use .txt or .docx'}), 415

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f'{uuid.uuid4()}.{ext}'
    filepath = os.path.join(UPLOADS_DIR, unique_name)
    file.save(filepath)

    try:
        text = _read_file_text(filepath)
    except Exception as e:
        os.remove(filepath)
        return jsonify({'error': f'File processing error: {str(e)}'}), 500

    if len(text) < 100:
        os.remove(filepath)
        return jsonify({'error': 'Text too short. Minimum 100 characters.'}), 400
    if len(text) > 5_000_000:
        os.remove(filepath)
        return jsonify({'error': 'Text too long. Maximum 5M characters.'}), 400

    dataset_id = f'user_{uuid.uuid4()}'
    user_datasets[dataset_id] = {'text': text, 'filepath': filepath}

    preview = text[:200].replace('\n', ' ')
    return jsonify({
        'dataset_id': dataset_id,
        'filename': file.filename,
        **_dataset_metadata(text, dataset_id, file.filename),
        'text_preview': preview,
    })


@app.route('/api/datasets/from-text', methods=['POST'])
def dataset_from_text():
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()

    if len(text) < 100:
        return jsonify({'error': 'Text too short. Minimum 100 characters.'}), 400
    if len(text) > 5_000_000:
        return jsonify({'error': 'Text too long. Maximum 5M characters.'}), 400

    dataset_id = f'user_{uuid.uuid4()}'
    user_datasets[dataset_id] = {'text': text, 'filepath': None}

    preview = text[:200].replace('\n', ' ')
    return jsonify({
        'dataset_id': dataset_id,
        'filename': 'pasted_text.txt',
        **_dataset_metadata(text, dataset_id, 'Pasted Text'),
        'text_preview': preview,
    })


# ---------------------------------------------------------------------------
# REST: Sessions
# ---------------------------------------------------------------------------

@app.route('/api/sessions/create', methods=['POST'])
def create_session():
    data = request.get_json(silent=True) or {}

    feature_type = data.get('feature_type', 'watch_learn')
    dataset_id = data.get('dataset_id', 'shakespeare')
    hyperparameters = data.get('hyperparameters', {})

    # Validate dataset exists
    bundled_names = [d[0] for d in BUNDLED_DATASETS]
    if dataset_id not in bundled_names and dataset_id not in user_datasets:
        return jsonify({'error': f'Dataset "{dataset_id}" not found'}), 404

    session_id = manager.create_session(feature_type, dataset_id, hyperparameters)
    session = manager.get_session(session_id)

    # Attach dataset text to session
    if dataset_id in user_datasets:
        session.text_corpus = user_datasets[dataset_id]['text']
        session.dataset_path = user_datasets[dataset_id].get('filepath', '')
    else:
        for name, _, filename in BUNDLED_DATASETS:
            if name == dataset_id:
                filepath = os.path.join(DATASETS_DIR, filename)
                session.dataset_path = filepath
                break

    return jsonify({
        'session_id': session_id,
        'status': session.status.value,
        'model_config': session.model_config,
        'training_config': session.training_config,
        'created_at': session.created_at.isoformat() + 'Z',
    })


@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    session = manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    max_iters = session.training_config.get('max_iters', 500)
    progress = session.current_iter / max_iters if max_iters > 0 else 0

    return jsonify({
        'session_id': session_id,
        'status': session.status.value,
        'current_iter': session.current_iter,
        'max_iters': max_iters,
        'progress': round(progress, 4),
        'started_at': session.started_at.isoformat() + 'Z' if session.started_at else None,
    })


@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    session = manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    manager.stop_training(session_id)
    manager.cleanup_session(session_id)

    return jsonify({'message': 'Session terminated', 'session_id': session_id})


@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    return jsonify({'sessions': manager.get_all_sessions()})


# ---------------------------------------------------------------------------
# WebSocket event handlers
# ---------------------------------------------------------------------------

@socketio.on('connect')
def on_connect():
    print(f'[WS] Client connected: {request.sid}')


@socketio.on('disconnect')
def on_disconnect():
    print(f'[WS] Client disconnected: {request.sid}')


@socketio.on('join_session')
def on_join_session(data):
    session_id = data.get('session_id')
    if session_id:
        join_room(session_id)
        emit('joined', {'session_id': session_id})


@socketio.on('start_training')
def on_start_training(data):
    session_id = data.get('session_id')
    session = manager.get_session(session_id)
    if not session:
        emit('error', {'session_id': session_id, 'error_type': 'session_not_found',
                        'message': 'Session not found', 'timestamp': _ts()})
        return

    if session.status == SessionStatus.RUNNING:
        return  # already running

    manager.start_training(session_id)
    join_room(session_id)

    socketio.emit('training_started', {
        'session_id': session_id,
        'timestamp': _ts(),
    }, room=session_id)

    # Launch background training task
    socketio.start_background_task(_run_training, session_id)


@socketio.on('pause_training')
def on_pause_training(data):
    session_id = data.get('session_id')
    if manager.pause_training(session_id):
        socketio.emit('training_paused', {
            'session_id': session_id,
            'current_step': manager.get_session(session_id).current_iter,
            'timestamp': _ts(),
        }, room=session_id)


@socketio.on('resume_training')
def on_resume_training(data):
    session_id = data.get('session_id')
    if manager.resume_training(session_id):
        socketio.emit('training_resumed', {
            'session_id': session_id,
            'timestamp': _ts(),
        }, room=session_id)


@socketio.on('stop_training')
def on_stop_training(data):
    session_id = data.get('session_id')
    if manager.stop_training(session_id):
        socketio.emit('training_stopped', {
            'session_id': session_id,
            'reason': 'user_requested',
            'timestamp': _ts(),
        }, room=session_id)


@socketio.on('step_training')
def on_step_training(data):
    session_id = data.get('session_id')
    session = manager.get_session(session_id)
    if not session or session.status != SessionStatus.PAUSED:
        return
    # Signal the training loop to execute one step then re-pause
    session.status = SessionStatus.RUNNING
    session._step_once = True


@socketio.on('set_speed')
def on_set_speed(data):
    session_id = data.get('session_id')
    speed = data.get('speed_multiplier', 1.0)
    manager.set_speed(session_id, speed)


# ---------------------------------------------------------------------------
# Background training loop — delegates to trainer.py
# ---------------------------------------------------------------------------

def _run_training(session_id: str):
    session = manager.get_session(session_id)
    if not session:
        return
    _trainer.run_training(session, socketio)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print('Starting LLMBreaker backend on http://localhost:5000')
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
