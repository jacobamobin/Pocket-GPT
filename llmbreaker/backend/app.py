import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'llmbreaker-dev-secret'

CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')


@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'LLMBreaker backend running'}


@socketio.on('connect')
def on_connect():
    print('Client connected')


@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    print('Starting LLMBreaker backend on http://localhost:5000')
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
