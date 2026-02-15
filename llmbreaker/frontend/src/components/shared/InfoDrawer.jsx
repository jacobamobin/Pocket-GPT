import { useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UIContext } from '../../contexts/UIContext'
import infoContent from '../../data/infoContent'

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-neural-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left
                   bg-neural-surface hover:bg-neural-border/40 transition-colors duration-150"
      >
        <span className="text-sm text-white/60 pr-2">{q}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-white/30 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-2.5 text-sm text-white/40 leading-relaxed border-t border-neural-border bg-neural-surface/50">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function InfoDrawer() {
  const { state, dispatch } = useContext(UIContext)
  const topic = state.infoDrawerTopic
  const content = topic ? infoContent[topic] : null

  // Close on Escape
  useEffect(() => {
    if (!topic) return
    const handler = (e) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_INFO_DRAWER' })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [topic, dispatch])

  return (
    <AnimatePresence>
      {content && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dispatch({ type: 'CLOSE_INFO_DRAWER' })}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 right-0 z-[70] h-full w-[400px] max-w-[90vw]
                       bg-neural-card border-l border-neural-border shadow-2xl
                       flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neural-border">
              <h2 className="text-base font-semibold text-white">{content.title}</h2>
              <button
                onClick={() => dispatch({ type: 'CLOSE_INFO_DRAWER' })}
                className="text-white/30 hover:text-white transition-colors text-xl leading-none
                           focus:outline-none focus:ring-1 focus:ring-gold-base/60 rounded"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Description */}
              <p className="text-sm text-white/40 leading-relaxed">{content.description}</p>

              {/* Key Concepts */}
              {content.concepts?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                    Key Concepts
                  </h3>
                  <ul className="space-y-2">
                    {content.concepts.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/40 leading-relaxed">
                        <span className="text-gold-light mt-0.5 shrink-0">&#8226;</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAQ */}
              {content.faq?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                    Common Questions
                  </h3>
                  <div className="space-y-2">
                    {content.faq.map((item, i) => (
                      <FAQItem key={i} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
