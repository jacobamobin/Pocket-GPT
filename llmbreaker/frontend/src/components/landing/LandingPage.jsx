import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedBackground from './AnimatedBackground'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0F172A' }}>

      <AnimatedBackground />

      {/* Radial glow behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)',
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
          className="font-bold text-transparent bg-clip-text leading-tight mb-4 select-none"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #06B6D4 100%)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          LLMBreaker
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-slate-300 mb-12 max-w-md"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          See intelligence emerge in real-time
        </motion.p>

        {/* Launch button */}
        <motion.button
          onClick={() => navigate('/app')}
          className="relative flex items-center gap-2 font-semibold text-white rounded-xl px-10 py-4 text-lg
                     bg-gradient-to-r from-blue-600 to-cyan-500
                     shadow-lg shadow-blue-500/25
                     border border-blue-400/20
                     focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          whileHover={{ y: -2, boxShadow: '0 12px 36px rgba(59,130,246,0.45)' }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Launch
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="absolute bottom-5 text-slate-600 text-xs tracking-wide select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Built for Hackathon 2026 · Runs 100% locally
      </motion.p>
    </div>
  )
}
