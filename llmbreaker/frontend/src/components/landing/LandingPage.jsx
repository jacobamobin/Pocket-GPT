import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neural-bg">
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
        LLMBreaker
      </h1>
      <p className="text-blue-300 text-xl mb-10">See intelligence emerge in real-time</p>
      <button
        className="btn-primary text-lg px-8 py-3"
        onClick={() => navigate('/app')}
      >
        Launch
      </button>
    </div>
  )
}
