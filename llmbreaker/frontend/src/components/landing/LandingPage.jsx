import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import AnimatedBackground from './AnimatedBackground'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-neural-bg bg-dots">

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

      {/* Footer note */}
      <motion.p
        className="absolute bottom-5 text-white/30 text-xs tracking-wide select-none text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Made for CTRL HACK DEL 2.0 by Jacob Mobin and Ethan Cha
      </motion.p>
    </div>
  )
}
