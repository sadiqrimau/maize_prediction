import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { WakeUpScreen } from './components/WakeUpScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Forecaster } from './pages/Forecaster';
import { ModelPerformance } from './pages/ModelPerformance';
import { About } from './pages/About';

function App() {
  return (
    <WakeUpScreen>
      <Router>
        <div className="min-h-screen bg-cream font-sans">
          <Navigation />
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary pageName="Dashboard">
                    <Dashboard />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/forecaster"
                element={
                  <ErrorBoundary pageName="Price Forecaster">
                    <Forecaster />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/performance"
                element={
                  <ErrorBoundary pageName="Model Performance">
                    <ModelPerformance />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/about"
                element={
                  <ErrorBoundary pageName="About">
                    <About />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </WakeUpScreen>
  );
}

export default App;
