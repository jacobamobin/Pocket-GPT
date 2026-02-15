import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CHAPTERS from '../../data/tutorialChapters'
import { useTutorial } from '../../contexts/TutorialContext'

// Mini visual components
import DatasetDiagram from './visuals/DatasetDiagram'
import ProgressDiagram from './visuals/ProgressDiagram'
import AttentionDiagram from './visuals/AttentionDiagram'
import LayerDiagram from './visuals/LayerDiagram'
import PhaseDiagram from './visuals/PhaseDiagram'

const VISUALS = {
  'dataset-diagram': DatasetDiagram,
  'progress-diagram': ProgressDiagram,
  'attention-diagram': AttentionDiagram,
  'layer-diagram': LayerDiagram,
  'phase-diagram': PhaseDiagram,
}

export default function TutorialSpotlight() {
  const { state, actions } = useTutorial()
  const { active, chapterId, stepIndex } = state

  const [targetRect, setTargetRect] = useState(null)
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 })
  const [isExiting, setIsExiting] = useState(false)
  const [exitStep, setExitStep] = useState(null)
  const resizeRef = useRef(null)

  // Get current step data
  const chapter = active ? CHAPTERS[chapterId] : null
  const step = chapter?.steps[stepIndex] || null
  const totalSteps = chapter?.steps.length || 0
  const isLastStep = stepIndex === totalSteps - 1
  const isFirstStep = stepIndex === 0

  // Use the step for positioning, but fall back to saved exit step during animation
  const positioningStep = isExiting ? exitStep : step

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!positioningStep?.target) {
      setTargetRect(null)
      return
    }

    const el = document.querySelector(positioningStep.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [positioningStep?.target])

  // Calculate card position based on target and preferred position
  const calculateCardPosition = useCallback(() => {
    if (!targetRect) {
      // Centered overlay
      return {
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      }
    }

    const cardWidth = Math.min(400, window.innerWidth - 40)
    const cardHeight = 300 // approximate
    const padding = 20

    let top = 0
    let left = 0
    let preferredPosition = positioningStep?.position || 'center'

    // Smart positioning: if target is in top half of screen, prefer bottom; if in bottom half, prefer top
    const targetCenterY = targetRect.top + targetRect.height / 2
    const isTargetInTopHalf = targetCenterY < window.innerHeight / 2

    switch (preferredPosition) {
      case 'top':
        top = targetRect.top - cardHeight - padding
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2
        // If card would go off top of screen, flip to bottom
        if (top < padding) {
          top = targetRect.bottom + padding
        }
        break
      case 'bottom':
        top = targetRect.bottom + padding
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2
        // If card would go off bottom of screen, flip to top
        if (top + cardHeight > window.innerHeight - padding) {
          top = targetRect.top - cardHeight - padding
        }
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2
        left = targetRect.left - cardWidth - padding
        // If card would go off left of screen, flip to right
        if (left < padding) {
          left = targetRect.right + padding
        }
        break
      case 'right':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2
        left = targetRect.right + padding
        // If card would go off right of screen, flip to left
        if (left + cardWidth > window.innerWidth - padding) {
          left = targetRect.left - cardWidth - padding
        }
        break
      case 'center':
        return {
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - cardWidth / 2,
        }
    }

    // Final bounds check - keep card fully within viewport
    const maxLeft = window.innerWidth - cardWidth - padding
    const maxTop = window.innerHeight - cardHeight - padding

    return {
      top: Math.max(padding, Math.min(top, maxTop)),
      left: Math.max(padding, Math.min(left, maxLeft)),
    }
  }, [targetRect, positioningStep])

  // Update positions
  useEffect(() => {
    measureTarget()
  }, [measureTarget])

  useEffect(() => {
    setCardPosition(calculateCardPosition())
  }, [calculateCardPosition])

  // Scroll to target element when step changes
  useEffect(() => {
    if (!active || !step?.target) return

    const element = document.querySelector(step.target)
    if (element) {
      // Small delay to let the UI update first
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [active, stepIndex, step?.target])

  // Handle window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      measureTarget()
      setCardPosition(calculateCardPosition())
    }

    const handleScroll = () => {
      measureTarget()
      setCardPosition(calculateCardPosition())
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true) // Use capture to catch all scroll events
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [measureTarget, calculateCardPosition])

  // Handle keyboard navigation
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        actions.endTutorial()
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        actions.nextStep()
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        actions.prevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, isLastStep, isFirstStep, actions])

  // Handle next step with completion check
  const handleNext = () => {
    if (isLastStep) {
      // Save step data before exiting so we can animate out properly
      setExitStep(step)
      setIsExiting(true)
      setTimeout(() => {
        actions.completeChapter()
        setIsExiting(false)
        setExitStep(null)
      }, 300) // Wait for exit animation to complete
    } else {
      actions.nextStep()
    }
  }

  // Handle previous step
  const handlePrev = () => {
    if (isFirstStep) {
      actions.endTutorial()
    } else {
      actions.prevStep()
    }
  }

  // Don't render if not active, but allow AnimatePresence to finish exit animation
  const shouldRender = active || (state.active && step)
  // Keep rendering during exit animation
  if ((!active && !isExiting) || !step) return null

  const VisualComponent = step.visual ? VISUALS[step.visual] : null

  // Generate box-shadow for spotlight cutout
  const spotlightStyle = targetRect ? {
    boxShadow: `
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      ${-targetRect.left}px ${-targetRect.top}px 0 ${targetRect.left}px rgba(0, 0, 0, 0.75),
      ${targetRect.right}px ${-targetRect.top}px 0 ${window.innerWidth - targetRect.right}px rgba(0, 0, 0, 0.75),
      ${-targetRect.left}px ${targetRect.bottom}px 0 ${targetRect.left}px rgba(0, 0, 0, 0.75),
      ${targetRect.right}px ${targetRect.bottom}px 0 ${window.innerWidth - targetRect.right}px rgba(0, 0, 0, 0.75)
    `,
  } : {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  }

  return (
    <AnimatePresence>
      <motion.div
        key="spotlight-backdrop"
        initial={{ opacity: 0 }}
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 pointer-events-none"
        style={spotlightStyle}
      />

      {/* Highlighted element border */}
      {targetRect && (
        <motion.div
          key="spotlight-highlight"
          initial={{ opacity: 0 }}
          animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            border: '3px solid rgb(34, 211, 238)',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.2)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <motion.div
        key="spotlight-card"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={isExiting ? { opacity: 0, scale: 0.95, y: 8 } : { opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25 }}
        className="fixed z-50 pointer-events-auto"
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          width: targetRect ? '380px' : '400px',
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <div className="bg-neural-card border border-neural-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header with step indicator */}
          <div className="px-5 py-4 border-b border-neural-border bg-neural-surface/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gold-light uppercase tracking-wider">
                  {chapter?.title || 'Tutorial'}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/30">
                  Step {stepIndex + 1} of {totalSteps}
                </span>
              </div>
              <button
                onClick={actions.endTutorial}
                className="text-white/30 hover:text-white transition-colors text-lg leading-none p-1"
                aria-label="Exit tutorial"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {/* Title */}
            <h3 className="text-base font-semibold text-white mb-3">
              {step.title}
            </h3>

            {/* Content */}
            <div className="text-sm text-white/40 leading-relaxed mb-4">
              {typeof step.content === 'string' ? (
                <p dangerouslySetInnerHTML={{ __html: step.content }} />
              ) : (
                step.content
              )}
            </div>

            {/* Visual diagram */}
            {VisualComponent && (
              <div className="mb-4 p-3 bg-white/[0.03]/50 rounded-lg border border-white/10/50">
                <VisualComponent />
              </div>
            )}

          </div>

          {/* Footer navigation */}
          <div className="px-5 py-3 border-t border-neural-border bg-neural-surface/30 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="text-sm text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.05]/50"
            >
              ← {isFirstStep ? 'Exit' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              className="text-sm bg-gold-base hover:bg-gold-base text-white px-4 py-1.5 rounded-md transition-colors font-medium"
            >
              {isLastStep ? 'Complete' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
