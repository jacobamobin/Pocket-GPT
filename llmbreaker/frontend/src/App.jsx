import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TrainingProvider } from './contexts/TrainingContext'
import { MetricsProvider }  from './contexts/MetricsContext'
import { UIProvider }       from './contexts/UIContext'
import LandingPage  from './components/landing/LandingPage'
import Dashboard    from './components/dashboard/Dashboard'

function App() {
  return (
    <TrainingProvider>
      <MetricsProvider>
        <UIProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"    element={<LandingPage />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="*"    element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UIProvider>
      </MetricsProvider>
    </TrainingProvider>
  )
}

export default App
