/**
 * Tutorial chapter definitions for the guided spotlight system.
 *
 * Each chapter has:
 * - id: Unique chapter identifier
 * - tabId: Which tab this chapter belongs to (null for welcome)
 * - title: Display name
 * - steps: Array of step objects with:
 *   - target: CSS selector for element to highlight (null for centered)
 *   - position: Where to place the card relative to target
 *   - title: Step heading
 *   - content: Main teaching text (2-3 sentences)
 *   - visual: Key for mini visual component (optional)
 */

const CHAPTERS = {
  welcome: {
    id: 'welcome',
    tabId: null,
    title: 'Welcome to Pocket GPT',
    steps: [
      {
        target: null,
        position: 'center',
        title: 'Ever wondered what\'s inside an AI as it learns?',
        content: `
          Large Language Models like GPT-4, Claude, and Gemini feel like magic. They answer questions, write code, and hold conversations. But <strong>how do they actually work?</strong><br><br>

          Pocket GPT lets you <strong>build, train, and dissect</strong> a real transformer model-the same architecture powering modern LLMs. It's tiny (15K-250K parameters vs GPT-4's ~1.8 trillion), but the principles are identical.<br><br>

          This isn't a dumbed-down simulation. You'll see real embeddings, real attention weights, real backpropagation. Everything scales from this tiny model to the giants.
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'Three Experiments, One Journey',
        content: `
          <strong>Watch It Learn</strong><br>
          Train a GPT-style model from scratch. Watch it go from random noise to coherent text. Understand tokens, embeddings, loss curves, and emergent learning phases.<br><br>

          <strong>Attention Cinema</strong><br>
          Visualize the transformer's breakthrough mechanism: self-attention. See how the model decides which words to focus on, and how multi-head attention captures multiple relationships simultaneously.<br><br>

          <strong>Style Transfer</strong><br>
          Fine-tune a model on your own writing. Watch it learn your unique voice - word choice, sentence structure, tone. Experience how AI can be personalized.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="tab-watch_learn"]',
        position: 'bottom',
        title: 'Let\'s Begin',
        content: `
          We'll start with the fundamentals in <strong>Watch It Learn</strong>. You'll understand how neural networks process text, what "training" really means, and why these models sometimes feel intelligent.<br><br>

          This tutorial is hands-on. You'll run experiments, see results in real-time, and build intuition for how LLMs work. Ready?
        `.trim(),
        visual: null,
      },
    ],
  },

  watch_learn: {
    id: 'watch_learn',
    tabId: 'watch_learn',
    title: 'Chapter 1: Watch It Learn',
    steps: [
      {
        target: null,
        position: 'center',
        title: 'Understanding Tokens',
        content: `
          Before we begin, let's understand what a <strong>token</strong> is. LLMs don't see text like we do-they break it into small pieces called tokens.<br><br>

          <strong>What's a token?</strong> Usually a few characters or a word. For example, "hello" might be one token, while "transformer" could be split into "trans" + "former".<br><br>

          This tiny model works at the <strong>character level</strong>-each letter, space, and punctuation mark is a separate token. So "cat" becomes three tokens: "c", "a", "t".<br><br>

          The model's job? Predict the next token given what came before. That's it. Everything else emerges from this simple pattern.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="dataset-selector"]',
        position: 'right',
        title: 'Choose Your Training Data',
        content: `
          The model learns by studying examples-this is called the <strong>training corpus</strong>. Pick Shakespeare to learn formal English with lots of "thee" and "thou", or Tiny Stories for simple modern language.<br><br>

          <strong>Why does data matter?</strong> The model can only learn patterns it sees. Feed it Shakespeare, and it learns archaic English. Feed it code, and it learns programming syntax.<br><br>

          Real LLMs like GPT-4 train on trillions of tokens from books, websites, code, and more. This tiny model trains on thousands-but the principle is identical.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="training-controls"]',
        position: 'right',
        title: 'Training Controls',
        content: `
          <strong>Play ▶:</strong> Start training-the model reads tokens and adjusts its internal weights<br>
          <strong>Pause:</strong> Pause to examine the current state<br>
          <strong>Next:</strong> Step forward one training iteration<br>
          <strong>Settings:</strong> Adjust model architecture (layers, heads, embedding size) and hyperparameters (learning rate, batch size)<br><br>

          Each training step, the model: <strong>1)</strong> Predicts the next token, <strong>2)</strong> Compares its guess to the actual answer, <strong>3)</strong> Adjusts its weights to do better next time. Repeat millions of times!
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="token-stream"]',
        position: 'top',
        title: 'Token Generation & Embeddings',
        content: `
          Watch the model generate tokens in real-time! Each token is first converted into a <strong>vector</strong> (a list of numbers called an <strong>embedding</strong>).<br><br>

          <strong>Why embeddings?</strong> Neural networks can't understand "a" or "b"-they need numbers. Each character gets mapped to a unique vector in high-dimensional space. Similar characters end up close together.<br><br>

          At first, embeddings are random, so the model outputs gibberish. As it trains, embeddings organize themselves-vowels cluster together, consonants form another group, and meaningful patterns emerge.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="loss-curve"]',
        position: 'top',
        title: 'Loss: Measuring Surprise',
        content: `
          The <strong>loss curve</strong> quantifies how "surprised" the model is by the correct answer. High loss = bad predictions. Low loss = good predictions.<br><br>

          <strong>Technically:</strong> We use <strong>cross-entropy loss</strong>, which measures the difference between the model's predicted probability distribution and the actual next token.<br><br>

          If the model gives the correct token 90% probability, loss is low. If it gives it 10% probability, loss is high. The training algorithm (<strong>backpropagation</strong>) uses this loss to compute how to adjust each weight.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="phase-label"]',
        position: 'right',
        title: 'Emergent Learning Phases',
        content: `
          Amazingly, the model learns in distinct phases without being explicitly programmed to do so:<br><br>

          <strong>Phase 1 - Character Distribution:</strong> Learns which tokens are common (spaces, "e", "t")<br>
          <strong>Phase 2 - Bigrams and Common Words:</strong> Learns "th", "he", "the", "and"<br>
          <strong>Phase 3 - Grammar and Syntax:</strong> Learns sentence structure, punctuation, capitalization<br>
          <strong>Phase 4 - Style:</strong> Captures the unique "voice" of the training text<br><br>

          This hierarchical learning emerges from the transformer's <strong>multi-layer architecture</strong>-early layers capture simple patterns, later layers compose them into complex structures.
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'Under the Hood: The Transformer',
        content: `
          You're training a real (but tiny) <strong>GPT-style transformer</strong> with ~15K-250K parameters, depending on your config. Compare this to:<br><br>

          • GPT-2: 1.5 billion parameters<br>
          • GPT-3: 175 billion parameters<br>
          • GPT-4: ~1.8 trillion parameters (estimated)<br><br>

          Despite being tiny, your model uses the same core components: <strong>token embeddings</strong>, <strong>positional encodings</strong>, <strong>multi-head self-attention</strong>, <strong>feed-forward layers</strong>, and <strong>layer normalization</strong>.<br><br>

          The magic? All it does is predict the next token. But by doing this billions of times across massive datasets, emergent capabilities appear: reasoning, knowledge retrieval, translation, and more.
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'Chapter Complete!',
        content: `
          You now understand the fundamentals:<br><br>
          - Tokens are the atomic units of text<br>
          - Embeddings map tokens to high-dimensional vectors<br>
          - Loss measures prediction accuracy<br>
          - Training is next-token prediction at scale<br>
          - Complex behaviors emerge from simple patterns<br><br>

          Ready to see <strong>how</strong> transformers process these tokens? Let's visualize attention patterns in Attention Cinema!
        `.trim(),
        visual: null,
      },
    ],
  },

  attention_cinema: {
    id: 'attention_cinema',
    tabId: 'attention_cinema',
    title: 'Chapter 2: Attention Cinema',
    steps: [
      {
        target: null,
        position: 'center',
        title: 'What is Attention?',
        content: `
          <strong>Attention</strong> is the breakthrough that made modern LLMs possible. Before transformers, models processed text sequentially, like reading left-to-right. They struggled with long-range dependencies.<br><br>

          <strong>The key insight:</strong> When predicting a token, the model should look at <em>all</em> previous tokens and decide which are relevant. Not every word matters equally!<br><br>

          Example: In "The cat sat on the mat because it was tired", predicting "tired" requires attending back to "cat" (not "mat"). Attention lets the model <strong>dynamically focus</strong> on relevant context.<br><br>

          This is called <strong>self-attention</strong> because the text attends to itself.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="attention-dataset"]',
        position: 'right',
        title: 'Pick a Text to Analyze',
        content: `
          Attention patterns reveal <strong>which tokens the model looks at</strong> when processing each position. Choose a dataset and train a model-we'll capture attention snapshots at every layer and head.<br><br>

          <strong>Why visualize?</strong> Attention is often called the "interpretability" mechanism of transformers. By seeing what the model focuses on, we gain insight into <em>how</em> it understands language.<br><br>

          Different datasets produce different patterns. Shakespeare has complex nested clauses. Code has structured syntax. See how attention adapts!
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="attention-controls"]',
        position: 'right',
        title: 'Start Training',
        content: `
          Press Play to train the model. Every few iterations, we'll <strong>snapshot</strong> the attention weights from every layer and head.<br><br>

          <strong>What are we capturing?</strong> For each token, the model computes a weighted sum of all previous token embeddings. The weights (0 to 1, summing to 1) are the <strong>attention scores</strong>.<br><br>

          Watch how attention evolves: early in training it's random noise. As the model learns, clear patterns emerge-some heads focus on adjacent tokens, others on syntactic relationships, still others on long-range semantic connections.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="view-mode-toggle"]',
        position: 'right',
        title: 'Three View Modes',
        content: `
          <strong>Evolution:</strong> Time-lapse of how a single head's attention changes during training. Watch random patterns crystallize into meaningful structure.<br><br>

          <strong>Grid:</strong> See all attention heads across all layers simultaneously. Each cell is a different "view" of the text. Together, they create a rich representation.<br><br>

          <strong>Detail:</strong> Zoom in on one head's full attention matrix. See exactly which tokens attend to which.<br><br>

          <strong>Pro tip:</strong> Different heads specialize! Some track syntax (nouns attending to adjectives), others semantics (pronouns attending to their referents).
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="attention-grid"]',
        position: 'top',
        title: 'Multi-Head Attention Explained',
        content: `
          Each cell is an <strong>attention head</strong>-an independent attention computation. Your model has multiple heads per layer, typically 4-8 in tiny models, up to 96 in GPT-4.<br><br>

          <strong>Why multiple heads?</strong> Language has many dimensions: syntax, semantics, coreference, style. One attention pattern can't capture everything. Multiple heads let the model attend to different aspects simultaneously.<br><br>

          <strong>Mathematically:</strong> Each head learns its own Query, Key, Value weight matrices. These project token embeddings into head-specific subspaces where attention is computed independently. Outputs are concatenated and mixed.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="layer-head-selector"]',
        position: 'right',
        title: 'Layer Hierarchy',
        content: `
          Transformers stack multiple <strong>layers</strong> (typically 12-96), each with multiple heads. This creates a <strong>hierarchical representation</strong>.<br><br>

          <strong>Layer 1 (Early):</strong> Local patterns-bigrams, adjacent tokens, syntax<br>
          <strong>Layer 2-3 (Middle):</strong> Phrase-level relationships, dependency structure<br>
          <strong>Layer 4+ (Deep):</strong> Long-range semantics, coreference, abstract meaning<br><br>

          Each layer's output becomes the next layer's input. Information flows bottom-up: raw tokens → local patterns → phrases → sentences → discourse.<br><br>

          <strong>Key insight:</strong> Depth gives transformers their power. Without it, attention is just a fancy weighted average.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="heatmap-detail"]',
        position: 'top',
        title: 'Reading the Attention Matrix',
        content: `
          The heatmap shows the attention matrix: rows are <strong>query tokens</strong> (what's being processed), columns are <strong>key tokens</strong> (what we're attending to).<br><br>

          <strong>How to read it:</strong> Cell (i,j) shows how much token i attends to token j. Bright = high attention. The model is "looking at" that token.<br><br>

          <strong>Causal masking:</strong> Notice the triangular pattern? Future tokens are masked (forced to zero). The model can't "cheat" by looking ahead. This ensures autoregressive generation-predicting one token at a time, left-to-right.<br><br>

          <strong>Common patterns:</strong> Diagonal = local attention. Vertical lines = important anchor tokens. Stripes = repeating structure (like code indentation).
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'The Math Behind Attention',
        content: `
          Let's get technical. For each token embedding <strong>x</strong>, we compute:<br><br>

          <strong>Q</strong> = x · W<sub>Q</sub> (Query: what am I looking for?)<br>
          <strong>K</strong> = x · W<sub>K</sub> (Key: what do I represent?)<br>
          <strong>V</strong> = x · W<sub>V</sub> (Value: what information do I carry?)<br><br>

          Attention scores = softmax(<strong>Q·K<sup>T</sup></strong> / √d<sub>k</sub>)<br>
          Output = attention scores · <strong>V</strong><br><br>

          The softmax ensures scores are probabilities (sum to 1). The scaling by √d<sub>k</sub> prevents exploding gradients in high dimensions. The result: a context-aware embedding that mixes information from all relevant positions.
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'Chapter Complete!',
        content: `
          You now understand the transformer's secret weapon:<br><br>

          - Self-attention dynamically focuses on relevant context<br>
          - Multi-head attention captures multiple relationships simultaneously<br>
          - Stacked layers build hierarchical representations<br>
          - Attention weights are interpretable-we can "see" what the model is thinking<br><br>

          This mechanism scales from tiny models (15K params) to massive ones (1T+ params) because it's fundamentally parallel-unlike RNNs, it doesn't bottleneck on sequential processing.<br><br>

          Ready to see transformers in action on your own writing? Let's try Style Transfer!
        `.trim(),
        visual: null,
      },
    ],
  },

  style_transfer: {
    id: 'style_transfer',
    tabId: 'style_transfer',
    title: 'Chapter 3: Style Transfer',
    steps: [
      {
        target: null,
        position: 'center',
        title: 'Fine-Tuning vs Pre-Training',
        content: `
          So far we've trained models from scratch. But what if you have a <strong>pre-trained model</strong> and want to specialize it? Enter <strong>fine-tuning</strong>.<br><br>

          <strong>Pre-training:</strong> Train on massive diverse data (billions of tokens). The model learns general language understanding. Expensive! Takes weeks on supercomputers.<br><br>

          <strong>Fine-tuning:</strong> Take that pre-trained model and continue training on a small specialized dataset (your writing, legal documents, medical texts). Cheap! Takes minutes on a laptop.<br><br>

          Style transfer is fine-tuning for personal writing style. The model already knows English grammar-now it learns <em>your</em> voice.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="style-input"]',
        position: 'right',
        title: 'Your Writing Sample',
        content: `
          Paste at least 50-100 words of your writing. More is better! The model will analyze:<br><br>

          <strong>Lexical patterns:</strong> Do you prefer "big" or "large"? "very" or "extremely"?<br>
          <strong>Syntactic structure:</strong> Short punchy sentences? Long flowing clauses?<br>
          <strong>Punctuation quirks:</strong> Em-dashes? Semicolons? Exclamation points?!<br>
          <strong>Rhetorical devices:</strong> Questions? Repetition for emphasis?<br>
          <strong>Tone:</strong> Formal, casual, sarcastic, technical?<br><br>

          Real-world applications: content generation, ghostwriting assistants, personalized chatbots, creative writing tools. This is how Character.AI and Replika work!
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="style-controls"]',
        position: 'right',
        title: 'Fine-Tuning Process',
        content: `
          Press Play to start fine-tuning. The model already knows general language (from pre-training or previous sessions). Now it adapts to <em>your</em> specific patterns.<br><br>

          <strong>What's happening?</strong> The model reads your text and adjusts its weights to increase the probability of generating text that matches your style. It's learning the conditional distribution P(token | your_style, context).<br><br>

          <strong>Overfitting risk:</strong> Too much training on too little data → the model memorizes rather than generalizes. Watch for loss hitting zero while outputs become repetitive. That's overfitting!
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="loss-curve"]',
        position: 'top',
        title: 'Convergence & Learning Rate',
        content: `
          The loss curve tells you when to stop. Too early → underfitting (didn't learn your style). Too late → overfitting (memorized your exact text).<br><br>

          <strong>Ideal curve:</strong> Steep drop, then gradual flattening, then plateau. Stop training around the plateau.<br><br>

          <strong>Learning rate matters:</strong> Too high → loss oscillates, model unstable. Too low → training takes forever. Modern trick: <strong>learning rate schedulers</strong> start high (fast progress) and gradually decrease (fine-tune details).<br><br>

          Notice bouncy loss? That's mini-batch <strong>stochastic gradient descent</strong>. Each training step uses a random subset of your data, causing variance. The overall trend matters, not individual steps.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="style-evolution"]',
        position: 'top',
        title: 'Watching Style Emerge',
        content: `
          On the left: your original text. On the right: the model's generations at different training steps.<br><br>

          <strong>Step 0:</strong> Generic pre-trained output. Grammatical but soulless.<br>
          <strong>Step 50:</strong> Starting to pick up your vocabulary and simple patterns.<br>
          <strong>Step 200:</strong> Sentence structure matches. Tone is similar.<br>
          <strong>Step 500:</strong> Feels like you wrote it! Uncanny valley crossed.<br><br>

          <strong>What's the model learned?</strong> Not just surface patterns, but statistical regularities that define your voice. It's captured the <strong>latent representation</strong> of your writing style in its embedding space.
        `.trim(),
        visual: null,
      },
      {
        target: '[data-tutorial="view-toggle"]',
        position: 'right',
        title: 'Evaluation Strategies',
        content: `
          <strong>Overview:</strong> Side-by-side comparison. Does it <em>feel</em> like your writing? Subjective but powerful.<br><br>

          <strong>Evolution:</strong> Time-lapse showing learning progression. Useful for diagnosing problems (did it learn anything? when did it plateau?).<br><br>

          <strong>Quantitative metrics:</strong> Perplexity (lower = better), BLEU score (measures similarity), but honestly? Human judgment is king. If it sounds like you, it worked.<br><br>

          <strong>Real-world challenge:</strong> Style transfer is an open research problem. We can mimic surface patterns, but capturing deeper aspects-humor, creativity, personality-remains hard. You're seeing the state-of-the-art!
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'The Bigger Picture',
        content: `
          Style transfer is one example of <strong>task-specific fine-tuning</strong>. The same principles apply to:<br><br>

          <strong>Domain adaptation:</strong> Medical LLM, legal LLM, code LLM<br>
          <strong>Instruction tuning:</strong> Train models to follow instructions (ChatGPT, Claude)<br>
          <strong>RLHF:</strong> Reinforcement Learning from Human Feedback-fine-tune using ratings<br>
          <strong>LoRA/QLoRA:</strong> Efficient fine-tuning of massive models by freezing most weights<br><br>

          The entire modern LLM ecosystem follows this pattern: <strong>pre-train once</strong> (expensive, foundational), <strong>fine-tune many times</strong> (cheap, specialized). You just experienced the fine-tuning half!
        `.trim(),
        visual: null,
      },
      {
        target: null,
        position: 'center',
        title: 'Tutorial Complete!',
        content: `
          You've completed the full Pocket GPT tutorial and learned:<br><br>

          <strong>Chapter 1:</strong> Tokens, embeddings, next-token prediction, emergent learning<br>
          <strong>Chapter 2:</strong> Self-attention, multi-head attention, transformer architecture<br>
          <strong>Chapter 3:</strong> Fine-tuning, style transfer, domain adaptation<br><br>

          <strong>Key takeaway:</strong> Modern LLMs are simple in principle (predict the next token using attention-based transformers) but incredibly powerful in practice. Scale + architecture + data = emergent intelligence.<br><br>

          Now go experiment! Try different datasets, architectures, and styles. You have the tools to understand how these "magic" systems actually work.
        `.trim(),
        visual: null,
      },
    ],
  },
}

export default CHAPTERS
