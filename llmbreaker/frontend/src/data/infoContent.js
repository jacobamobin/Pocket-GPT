/**
 * Educational content for every major component in LLMBreaker.
 * Keyed by topicId — referenced by <InfoIcon topicId="..." />.
 */

const infoContent = {
  // ── Tab-level ────────────────────────────────────────────────
  'watch-it-learn': {
    title: 'Watch It Learn',
    description:
      'This tab lets you watch a tiny language model (a GPT-style transformer) learn to generate text in real time. ' +
      'You pick a dataset, press play, and see the model go from random gibberish to recognisable language as the loss drops.',
    concepts: [
      'The model starts with random weights and has no knowledge of language.',
      'Each training step feeds a batch of text and adjusts the weights to reduce prediction error (loss).',
      'Lower loss means the model is better at predicting the next character or token.',
      'Generated text samples let you see qualitative improvement alongside the numbers.',
    ],
    faq: [
      {
        q: 'Why does the text start as gibberish?',
        a: 'Before training, the model\'s weights are random, so it has no idea which characters follow which. ' +
           'As it sees more data, it learns patterns like common words, spacing, and punctuation.',
      },
      {
        q: 'What does "loss" actually mean?',
        a: 'Loss measures how surprised the model is by the correct answer. High loss = very surprised (bad predictions). ' +
           'Low loss = the model expected the right answer (good predictions). It\'s calculated using cross-entropy.',
      },
      {
        q: 'How long should I train for?',
        a: 'It depends on the dataset size and model. For Shakespeare with a medium model, 3,000-5,000 steps usually produces readable text. ' +
           'Watch the loss curve — when it flattens, more training won\'t help much.',
      },
    ],
  },

  'attention-cinema': {
    title: 'Attention Cinema',
    description:
      'Attention Cinema visualises the self-attention mechanism inside the transformer. ' +
      'You can watch attention patterns form, compare layers and heads, and explore the data in 2D heatmaps or interactive 3D.',
    concepts: [
      'Self-attention lets each token "look at" every other token to decide what\'s relevant.',
      'Each layer has multiple heads — each head can learn a different relationship (e.g. nearby words, sentence structure).',
      'Bright cells in a heatmap mean the row token is paying strong attention to the column token.',
      'Patterns become more structured as training progresses.',
    ],
    faq: [
      {
        q: 'What are layers and heads?',
        a: 'A transformer is a stack of layers, and each layer has several attention heads. ' +
           'Each head independently learns what to pay attention to. Think of heads as different "perspectives" the model uses simultaneously.',
      },
      {
        q: 'Why do early heatmaps look random?',
        a: 'Before training, the attention weights are essentially random noise. ' +
           'As the model learns, each head discovers useful patterns — some attend to the previous token, others look for structural cues.',
      },
      {
        q: 'What does a diagonal pattern mean?',
        a: 'A strong diagonal means each token is paying attention to itself or its immediate neighbours. ' +
           'This is a common pattern — it\'s how the model learns local context like word spelling.',
      },
    ],
  },

  'style-transfer': {
    title: 'Style Transfer',
    description:
      'Style Transfer trains a small language model on your own writing so it learns to generate text in your personal style. ' +
      'Paste or upload your writing, start training, and watch the model evolve from random output to your voice.',
    concepts: [
      'The model learns statistical patterns: word choice, sentence length, punctuation habits, and more.',
      'With enough training data and steps the output starts to sound like you wrote it.',
      'The loss curve shows how well the model is fitting your writing patterns.',
      'More text gives the model more patterns to learn from.',
    ],
    faq: [
      {
        q: 'How much text do I need?',
        a: 'At minimum ~50 words, but the more the better. A few paragraphs (500+ words) gives much better results. ' +
           'The model has limited capacity, so extremely long texts won\'t all be memorised — it captures patterns instead.',
      },
      {
        q: 'Can it really learn my style?',
        a: 'A tiny model can capture surface-level style like vocabulary, sentence length, and common phrases. ' +
           'It won\'t understand meaning or complex rhetoric, but you\'ll recognise the flavour of your writing.',
      },
      {
        q: 'What file formats are supported?',
        a: 'Plain text (.txt) and Word documents (.docx). Text files are read directly in the browser; .docx files are uploaded to the backend for processing.',
      },
    ],
  },

  // ── Shared components ────────────────────────────────────────
  'training-controls': {
    title: 'Training Controls',
    description:
      'The control panel lets you start, pause, resume, stop, and step through training. ' +
      'You can also adjust the training speed and watch a real-time progress bar with ETA.',
    concepts: [
      'Play starts (or resumes) training. Pause freezes it mid-step without losing progress.',
      'Stop ends the session entirely — you\'ll need to restart from scratch.',
      'Step (available when paused) runs exactly one training step so you can inspect changes carefully.',
      'Speed controls how fast data is fed — higher speed is less smooth but finishes faster.',
    ],
    faq: [
      {
        q: 'What happens when I pause?',
        a: 'The model\'s weights are preserved in memory. When you resume, training picks up exactly where it left off — no work is lost.',
      },
      {
        q: 'What does the speed slider do?',
        a: 'It controls how often the frontend requests updates. Higher speed = more steps per update = faster progress but choppier animations.',
      },
    ],
  },

  'loss-curve': {
    title: 'Loss Curve',
    description:
      'The loss curve charts training loss (and optionally validation loss) over time. ' +
      'It\'s the primary way to judge whether the model is learning.',
    concepts: [
      'Training loss measures how well the model fits the data it\'s being trained on.',
      'Validation loss measures performance on held-out data the model hasn\'t seen.',
      'A gap between train and val loss (train lower) suggests overfitting.',
      'Perplexity (shown in the indicator) is exp(loss) — it roughly means "how many choices the model is confused between".',
    ],
    faq: [
      {
        q: 'Why does loss go down then flatten?',
        a: 'Early on there are lots of easy patterns to learn (common letters, spaces). Once those are captured, remaining improvements are harder, so progress slows.',
      },
      {
        q: 'What is a good loss value?',
        a: 'It depends on the dataset. For character-level Shakespeare, a train loss around 1.0-1.5 produces readable text. ' +
           'The perplexity indicator gives a more intuitive quality signal.',
      },
    ],
  },

  'dataset-selector': {
    title: 'Dataset Selector',
    description:
      'Choose which text corpus the model trains on. Built-in datasets like Shakespeare are ready to go, ' +
      'or you can upload your own .txt / .docx file.',
    concepts: [
      'The dataset determines what patterns the model learns — Shakespeare produces Elizabethan English, your blog produces your voice.',
      'Character count, word count, and vocabulary size are shown for each dataset.',
      'Smaller datasets train faster but give the model less variety to learn from.',
    ],
    faq: [
      {
        q: 'Can I use my own text?',
        a: 'Yes! Click "Upload .txt / .docx" below the dropdown. Plain text files are read in the browser; .docx is processed on the backend.',
      },
      {
        q: 'Does dataset size matter?',
        a: 'Bigger datasets give the model more examples of language patterns. Very small datasets (< 1,000 chars) may lead to overfitting where the model memorises rather than generalises.',
      },
    ],
  },

  'training-config': {
    title: 'Training Configuration',
    description:
      'Fine-tune model size, training duration, and update frequency. These settings determine how powerful the model is and how long training takes.',
    concepts: [
      'Model size (Small / Medium / Large) controls the number of parameters — larger models learn better but train slower.',
      'Training steps control how many optimisation passes the model makes over the data.',
      'Update frequency determines how often charts refresh and text samples are generated.',
    ],
    faq: [
      {
        q: 'Which model size should I pick?',
        a: 'Medium is a good default. Small is great for quick demos (trains in seconds). Large produces the best results but takes longer.',
      },
      {
        q: 'What are "training steps"?',
        a: 'Each step takes a batch of text, computes a prediction, measures the error, and updates the model weights. More steps = more learning opportunities.',
      },
    ],
  },

  'file-uploader': {
    title: 'File Uploader',
    description:
      'Drag-and-drop or click to upload a text file. Supported formats are .txt (read locally) and .docx (processed on the server).',
    concepts: [
      '.txt files are read entirely in the browser — nothing is sent to a server until training starts.',
      '.docx files are uploaded to the backend where the text is extracted and tokenised.',
      'Only one file can be uploaded at a time.',
    ],
    faq: [
      {
        q: 'Is my data sent anywhere?',
        a: '.txt files stay in your browser until you start training. .docx files are uploaded to the local backend server for processing. No data is sent to external services.',
      },
      {
        q: 'What\'s the maximum file size?',
        a: 'There\'s no hard limit, but very large files (> 10 MB) may be slow to process. The model can only learn from a window of text at a time anyway.',
      },
    ],
  },

  // ── Tab-specific sub-components ──────────────────────────────
  'text-progression': {
    title: 'Text Progression',
    description:
      'This panel shows text samples generated at regular intervals during training. ' +
      'Watch the output evolve from random noise to coherent language.',
    concepts: [
      'Each row is a sample generated at a specific training step.',
      'Colour shifts from grey (early / poor) to cyan (late / good) to show quality progression.',
      'Hovering a point on the loss curve highlights the corresponding text sample.',
    ],
    faq: [
      {
        q: 'Why are early samples so bad?',
        a: 'The model starts with random weights, so its "writing" is just random characters. ' +
           'After a few hundred steps it learns common characters; after a few thousand it produces real words.',
      },
      {
        q: 'How often are samples generated?',
        a: 'A new sample appears every eval_interval steps (configurable in Training Configuration — default is every 100 steps).',
      },
    ],
  },

  'attention-heatmap': {
    title: 'Attention Heatmap Grid',
    description:
      'A grid view showing every attention head in the model at once. ' +
      'Each small heatmap represents one head from one layer. Click any cell to switch to detail view.',
    concepts: [
      'Rows and columns represent tokens in the input sequence.',
      'Bright (blue) cells = high attention weight — the row token is "looking at" the column token.',
      'Dark cells = the row token is ignoring the column token.',
      'Different heads in the same layer often learn complementary patterns.',
    ],
    faq: [
      {
        q: 'Why do some heads look the same?',
        a: 'Sometimes two heads converge on similar patterns, especially in small models. This is called head redundancy and is normal.',
      },
      {
        q: 'Can I zoom into a single head?',
        a: 'Yes! Click any cell in the grid to switch to Detail view, which shows a larger heatmap for that specific layer and head.',
      },
    ],
  },

  'attention-evolution': {
    title: 'Attention Evolution',
    description:
      'Side-by-side comparison of an attention head\'s pattern at the beginning vs the current point of training. ' +
      'This makes it easy to see how attention becomes structured.',
    concepts: [
      'The left panel shows the first captured snapshot (early training).',
      'The right panel shows the most recent snapshot.',
      'As training progresses, random noise gives way to structured attention patterns.',
    ],
    faq: [
      {
        q: 'What kind of structures should I look for?',
        a: 'Common patterns include: diagonal (attending to self/neighbours), vertical stripes (all tokens attending to one key token), and block patterns (segment-level attention).',
      },
      {
        q: 'Why does it need at least 2 checkpoints?',
        a: 'Evolution is a comparison, so we need at least an early and a later snapshot to compare. Keep training and snapshots will appear at each eval interval.',
      },
    ],
  },

  'attention-3d': {
    title: '3D Attention View',
    description:
      'An interactive 3D bar chart of attention weights. Bar height represents attention strength. ' +
      'Drag to rotate, scroll to zoom.',
    concepts: [
      'Each bar corresponds to one cell in the attention matrix (row token attending to column token).',
      'Taller bars = higher attention weight.',
      'The view is limited to the first 16x16 tokens for performance.',
      'Colour intensity also encodes attention strength (darker = higher).',
    ],
    faq: [
      {
        q: 'How do I navigate the 3D view?',
        a: 'Click and drag to rotate the view. Use the scroll wheel to zoom in/out. The camera always looks toward the centre of the grid.',
      },
      {
        q: 'Why only 16x16 tokens?',
        a: 'Rendering hundreds of 3D bars would be slow. 16x16 (256 bars) gives a good representation of the attention pattern while keeping the visualisation smooth.',
      },
    ],
  },

  'style-evolution': {
    title: 'Style Evolution',
    description:
      'Watch how the model\'s generated text evolves to match your writing style over the course of training. ' +
      'Samples are tagged as Early, Learning, or Mature.',
    concepts: [
      'Early samples are random — the model hasn\'t seen enough data yet.',
      'As training continues, the model picks up your vocabulary and sentence patterns.',
      'Mature samples should sound recognisably like your writing.',
      'The style match percentage shows how close the model\'s output is to your original metrics.',
    ],
    faq: [
      {
        q: 'What metrics are compared?',
        a: 'Currently the app compares average word length and sentence length between your text and the model\'s output. These are simple but surprisingly revealing style markers.',
      },
      {
        q: 'Why does improvement sometimes go down?',
        a: 'The model explores during training and might temporarily generate text that\'s further from your style. This is normal — it usually recovers with more steps.',
      },
    ],
  },
}

export default infoContent
