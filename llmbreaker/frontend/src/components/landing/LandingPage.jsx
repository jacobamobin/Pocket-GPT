import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiZap, FiEye, FiEdit3 } from 'react-icons/fi'
import AnimatedBackground from './AnimatedBackground'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-neural-bg">

      {/* ── HERO (existing, 100vh) ─────────────────────────── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-dots">

        <AnimatedBackground />

        {/* Radial glow behind content */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(167,139,113,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Title */}
          <motion.h1
            className="font-serif italic font-bold text-transparent bg-clip-text leading-tight mb-4 select-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              backgroundImage: 'linear-gradient(135deg, #a78b71 0%, #c9b8a0 100%)',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Pocket GPT
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-white/60 font-sans mb-12 max-w-md"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Train and breakdown your own GPT models - all on device
          </motion.p>

          {/* Launch button */}
          <motion.button
            onClick={() => navigate('/app')}
            className="relative flex items-center gap-2 font-semibold text-black rounded-full px-10 py-4 text-lg
                       bg-white hover:bg-gold-hover
                       shadow-lg hover:shadow-lg
                       transition-all duration-300"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Launch
            <FiArrowRight className="w-5 h-5" />
          </motion.button>

        </motion.div>

      {/* Hero footer credit */}
      <motion.p
        className="absolute bottom-5 text-white/30 text-xs tracking-wide select-none text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Built at CTRL HACK DEL 2.0 by Jacob Mobin &amp; Ethan Cha
      </motion.p>
      </div>

      {/* ── Section 1: The Problem ─────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">The Problem</p>
          <h2
            className="font-serif italic font-bold text-white mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            LLMs are black boxes.<br />
            <span className="text-white/40">They don&apos;t have to be.</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Every day, millions of developers send text to GPT-4, Claude, and Gemini and get answers back.
            But what&apos;s happening inside? Tokens, attention heads, embeddings, backpropagation, invisible
            behind a single API call.<br /><strong className="text-white/70">Pocket GPT changes that.</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="card p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">The usual way</p>
            <div className="font-mono text-sm text-white/50 bg-white/[0.03] rounded-xl p-4 mb-4 leading-relaxed">
              <span className="text-white/30">POST</span> /v1/chat/completions<br />
              <span className="text-white/20">→ ??? (magic) →</span><br />
              <span className="text-white/50">&quot;Here is your answer.&quot;</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              You send text. Text comes back. No idea what happened in between.
              What did the model attend to? How did it decide? You&apos;ll never know.
            </p>
          </motion.div>

          <motion.div
            className="card p-8"
            style={{ background: 'rgba(167,139,113,0.04)', borderColor: 'rgba(167,139,113,0.2)' }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">With Pocket GPT</p>
            <ul className="space-y-2 mb-4">
              {[
                'Watch every token prediction in real time',
                'See attention heatmaps across all layers & heads',
                'Inspect embeddings as they organize in 3D space',
                'Follow emergent learning phases as they happen',
                'Train on your own data, see your style captured',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-gold-light mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-white/40 text-sm">Zero black boxes. All on device. No API key required.</p>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            { value: '~15K–250K', label: 'Parameters you can see' },
            { value: '3', label: 'Interactive visualizations' },
            { value: '20+', label: 'Guided tutorial steps' },
            { value: '100%', label: 'On-device, no API key' },
          ].map((stat, i) => (
            <div key={i} className="card text-center py-5">
              <p className="font-mono text-gold-light text-xl font-bold">{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <div className="border-t border-white/[0.06] max-w-6xl mx-auto" />

      {/* ── Section 2: Three Feature Cards ────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Features</p>
          <h2
            className="font-serif italic font-bold text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Three windows into your model
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              chapter: 'Chapter 1',
              title: 'Watch It Learn',
              description: 'Train a GPT-style transformer from scratch and watch it learn in real time. Live loss curve, character-by-character token stream, 3D embedding star map, and emergent phase detection — from random noise to coherent text.',
              bullets: ['Live loss curve', '3D embedding star map', 'Token stream', 'Emergent phase labels'],
              icon: FiZap,
              delay: 0.1,
            },
            {
              chapter: 'Chapter 2',
              title: 'Attention Cinema',
              description: 'Visualize the breakthrough mechanism behind every modern LLM: self-attention. See exactly which tokens attend to which across every layer and head, in 2D heatmaps or immersive 3D views.',
              bullets: ['2D & 3D heatmaps', 'All layers & heads', 'Evolution over training', 'Causal mask visible'],
              icon: FiEye,
              delay: 0.2,
            },
            {
              chapter: 'Chapter 3',
              title: 'Style Transfer',
              description: 'Paste your own writing and watch the model learn your voice. Fine-tune on your text and compare outputs step by step — word choice, sentence rhythm, tone — all captured and visualized.',
              bullets: ['Paste your own text', 'Side-by-side comparison', 'Style evolution timeline', 'Overfitting detection'],
              icon: FiEdit3,
              delay: 0.3,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="card p-8 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <feature.icon className="w-7 h-7 text-gold-light mb-4" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-2">{feature.chapter}</span>
              <h3 className="text-xl font-serif italic font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">{feature.description}</p>
              <ul className="space-y-1.5">
                {feature.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-white/40">
                    <span className="w-1 h-1 rounded-full bg-gold-muted flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-white/[0.06] max-w-6xl mx-auto" />

      {/* ── Section 3: The Guided Tutorial ────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Education First</p>
            <h2
              className="font-serif italic font-bold text-white mb-6"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              A guided tutorial that actually teaches you how LLMs work
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Most LLM explainers stop at analogies. Pocket GPT goes further. It&apos;s a 3-chapter,
              20+ step interactive tutorial built into the app, where every concept is tied to a live
              visualization. Spotlight-guided, no setup required.
            </p>

            <div className="space-y-6">
              {[
                {
                  num: '01',
                  title: 'Tokens, Embeddings & Loss',
                  desc: 'Understand the atomic units of language models, how they get mapped to vectors, what the loss curve actually measures, and how emergent learning phases appear without being programmed.',
                },
                {
                  num: '02',
                  title: 'Self-Attention & Multi-Head Architecture',
                  desc: 'See the Q·Kᵀ math come to life. Watch attention heads specialize in syntax vs. semantics. Understand the causal mask and why depth gives transformers their power.',
                },
                {
                  num: '03',
                  title: 'Fine-Tuning & Style Transfer',
                  desc: 'Learn the difference between pre-training and fine-tuning. Adapt the model to your own writing and observe convergence, overfitting, and style capture in real time.',
                },
              ].map((chapter, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <span className="font-mono text-gold-light/40 text-sm mt-0.5 flex-shrink-0 w-6">{chapter.num}</span>
                  <div>
                    <p className="text-white/80 text-sm font-semibold mb-1">{chapter.title}</p>
                    <p className="text-white/40 text-sm leading-relaxed">{chapter.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card p-8"
            style={{ background: 'rgba(167,139,113,0.03)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">Tutorial — Welcome</span>
            </div>
            <h3 className="text-lg font-serif italic font-bold text-white mb-3">
              Ever wondered what&apos;s inside an AI as it learns?
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Pocket GPT lets you <strong className="text-white/70">build, train, and dissect</strong> a real transformer —
              the same architecture powering GPT-4, Claude, and Gemini. It&apos;s tiny
              (~15K–250K parameters vs GPT-4&apos;s ~1.8 trillion), but the principles are identical.
              This isn&apos;t a simulation. You&apos;ll see real embeddings, real attention weights, real backpropagation.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">Step 1 of 20+</span>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-gold-light' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-white/[0.06] max-w-6xl mx-auto" />

      {/* ── Section 4: How It Works ────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Under the Hood</p>
          <h2
            className="font-serif italic font-bold text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              num: '1',
              title: 'Load Dataset',
              desc: 'Choose from Shakespeare, Tiny Stories, or paste your own text. The model tokenizes it at the character level — each letter is a separate token.',
            },
            {
              num: '2',
              title: 'Configure Architecture',
              desc: 'Set transformer layers, attention heads, embedding size, learning rate, batch size, and context length — all exposed and adjustable.',
            },
            {
              num: '3',
              title: 'Train Live',
              desc: 'Real PyTorch running in a local Python process. Real backpropagation. Metrics stream to the browser via WebSocket in real time.',
            },
            {
              num: '4',
              title: 'Inspect Internals',
              desc: 'Loss curves, attention heatmaps, 3D embedding maps, token probabilities — captured at every step and visualized instantly.',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="card p-6 relative"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono mb-4"
                style={{ background: 'rgba(167,139,113,0.15)', color: '#a78b71', border: '1px solid rgba(167,139,113,0.3)' }}
              >
                {step.num}
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm">{step.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-white/[0.06] max-w-6xl mx-auto" />

      {/* ── Section 5: CTA + Credits ───────────────────────────── */}
      <section className="px-6 py-32 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-serif italic font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to see inside?
          </h2>
          <p className="text-white/40 mb-10 max-w-md mx-auto text-base leading-relaxed">
            No API key. No cloud. Train a real GPT on your machine and watch every weight update happen.
          </p>
          <motion.button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 font-semibold text-black rounded-full px-10 py-4 text-lg bg-white hover:bg-gold-hover shadow-lg transition-all duration-300"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Launch Pocket GPT
            <FiArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-24 pt-8 border-t border-white/[0.06] space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-white/20 text-xs tracking-wide">
            Built at CTRL HACK DEL 2.0 by Jacob Mobin &amp; Ethan Cha
          </p>
          <p className="text-white/20 text-xs tracking-wide">
            Transformer architecture based on{' '}
            <a
              href="https://github.com/bdunagan/bdunaganGPT"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/50 transition-colors"
            >
              bdunaganGPT
            </a>{' '}
            by Brian Dunagan (MIT License)
          </p>
          <p className="text-white/20 text-xs tracking-wide">
            Inspired by{' '}
            <a
              href="https://karpathy.ai/zero-to-hero.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/50 transition-colors"
            >
              Andrej Karpathy&apos;s Zero to Hero
            </a>
          </p>
        </motion.div>
      </section>

    </div>
  )
}
