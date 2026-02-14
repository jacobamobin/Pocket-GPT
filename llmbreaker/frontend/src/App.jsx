import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TrainingProvider } from './contexts/TrainingContext'
import { MetricsProvider }  from './contexts/MetricsContext'
import { ModelProvider }    from './contexts/ModelContext'
import { UIProvider }       from './contexts/UIContext'
import { TutorialProvider } from './contexts/TutorialContext'
import { GenerationProvider } from './contexts/GenerationContext'
import LandingPage  from './components/landing/LandingPage'
import Dashboard    from './components/dashboard/Dashboard'

function App() {
  return (
    <GenerationProvider>
    <TutorialProvider>
      <TrainingProvider>
        <MetricsProvider>
          <ModelProvider>
            <UIProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route path="/"    element={<LandingPage />} />
                  <Route path="/app" element={<Dashboard />} />
                  <Route path="*"    element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </UIProvider>
          </ModelProvider>
        </MetricsProvider>
      </TrainingProvider>
    </TutorialProvider>
    </GenerationProvider>
  )
}

export default App
