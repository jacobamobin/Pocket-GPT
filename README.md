# Pocket GPT 

> **Built for CTRL HACK DEL 2.0**

Pocket GPT is an interactive educational platform that lets you train a miniature GPT model live in your browser — watching it learn in real time. Most people interact with AI as a black box: you type, it answers, and nothing in between is visible. Pocket GPT breaks open that box.

In under a minute, you can watch a transformer go from random noise to recognizable language, see every attention head fire, and understand why the model picks one word over another. No PhD required.
Now the next time you implement a LLM in your next project, you know whats actually going on behind the scenes.

---

## What It Does

Pocket GPT gives you three interactive experiences, each designed to make a different concept tangible:

### Watch It Learn
Train a character-level GPT from scratch on a dataset of your choice (Shakespeare, Python code, or Wikipedia). Watch the loss curve drop in real time as the model learns to string characters into words, words into sentences. See generated text evolve from gibberish to coherent prose. Inspect the next-token probability distribution and tweak the sampling temperature to understand how randomness shapes output.

### Attention Cinema
Visualize the transformer's attention mechanisms as the model trains. See which tokens each attention head focuses on through live-updating heatmaps — both 2D and 3D. Watch how attention patterns evolve over training steps, from diffuse noise to structured, purposeful focus. The layer/head selector lets you isolate individual attention heads and observe how they specialize.

### Style Transfer
Paste in your own writing — a few paragraphs, a short story, a blog post — and watch the model learn your voice. With a small model and short training run, you can see the generated text shift from random characters toward something that sounds like you, complete with your vocabulary, punctuation habits, and sentence rhythm.

---

## How It Works

The model is a from-scratch character-level transformer (`micro_gpt.py`) — roughly 7,900 to 200,000 parameters depending on the size preset you choose. It's small enough to train fast on CPU, but architecturally identical to the GPT models powering modern AI.

Architecture:
- Token embeddings + positional embeddings
- N transformer blocks (each: LayerNorm → Multi-Head Self-Attention → LayerNorm → Feed-Forward)
- Weight-tied output projection back to vocabulary
- Cosine learning rate decay with optional warmup

The frontend connects to the backend via WebSocket. As training runs, the backend streams loss values, generated text samples, attention snapshots, and token probability distributions to the UI — all updated step by step.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Framer Motion
- Three.js (3D attention heatmap)
- Socket.IO client

**Backend**
- Python + Flask + Flask-SocketIO
- PyTorch (CPU training)
- python-docx (for `.docx` upload support)

---

## Running Locally

**Backend**

```bash
cd Pocket GPT/backend
pip install -r requirements.txt
python app.py
```

Runs on `http://localhost:5000`.

**Frontend**

```bash
cd Pocket GPT/frontend
npm install
npm run dev -- --port 5173
```

Runs on `http://localhost:5173`.

---

## Project Structure

```
llmbreaker/ (old name)
├── backend/
│   ├── app.py                  # Flask + SocketIO entry point
│   ├── micro_gpt.py            # Transformer model (from scratch)
│   ├── trainer.py              # Training loop + metrics emission
│   ├── training_manager.py     # Session lifecycle management
│   ├── metrics_emitter.py      # Real-time WebSocket event emission
│   ├── checkpoint_manager.py   # Model save/load
│   ├── dataset_loader.py       # Dataset preprocessing
│   └── models.py               # Data models / session state
└── frontend/
    └── src/
        ├── components/
        │   ├── dashboard/      # Header, tab bar, model library
        │   ├── tabs/           # Watch It Learn, Attention Cinema, Style Transfer
        │   ├── shared/         # Loss curve, training controls, dataset selector
        │   └── tutorial/       # Guided tutorial overlay system
        ├── contexts/           # React context (training, metrics, UI, models)
        ├── hooks/              # WebSocket, training session, tab persistence
        └── utils/              # API client
```

---

## Guided Tutorial

Pocket GPT includes a built-in 3-chapter guided tutorial (20+ steps) that walks you through:

1. **Foundations** — What a language model is, how tokens work, what loss means
2. **Training Dynamics** — The loss curve, learning rate, overfitting, generalization
3. **Internals** — Attention heads, embeddings, temperature sampling

Each step highlights the relevant UI element, explains what you're looking at, and why it matters. Designed for people who have used AI but never looked under the hood.

---

## Attribution

The transformer architecture in `micro_gpt.py` is based on **[bdunaganGPT](https://github.com/bdunagan/bdunaganGPT)** by [Brian Dunagan](https://github.com/bdunagan) (MIT License), which is itself derived from **[Andrej Karpathy's](https://karpathy.ai) Zero to Hero** lecture series — specifically the [makemore](https://github.com/karpathy/makemore) and nanoGPT work.

---

## Devpost

Submitted to CTRL HACK DEL 2.0. Devpost link: *(add link here)*

---

## Authors

**Jacob Mobin** — [@jacobamobin](https://github.com/jacobamobin)

**Ethan Cha** — [@ethanchac](https://github.com/ethanchac)

---

## License

MIT
