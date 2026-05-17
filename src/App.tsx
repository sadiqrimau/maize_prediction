import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { WakeUpScreen } from './components/WakeUpScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Forecaster } from './pages/Forecaster';
import { ModelPerformance } from './pages/ModelPerformance';
import { Validation } from './pages/Validation';
import { SystemGuide } from './pages/SystemGuide';
import { About } from './pages/About';
import { isAuthenticated, logout } from './utils/auth';

function App() {
  const [authed, setAuthed] = useState(isAuthenticated());

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  return (
    <WakeUpScreen>
      <Router>
        <div className="min-h-screen bg-cream font-sans flex flex-col">
          <Navigation onLogout={() => { logout(); setAuthed(false); }} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <ErrorBoundary pageName="Dashboard"><Dashboard /></ErrorBoundary>
              } />
              <Route path="/forecaster" element={
                <ErrorBoundary pageName="Price Forecaster"><Forecaster /></ErrorBoundary>
              } />
              <Route path="/performance" element={
                <ErrorBoundary pageName="Model Performance"><ModelPerformance /></ErrorBoundary>
              } />
              <Route path="/validation" element={
                <ErrorBoundary pageName="Validation"><Validation /></ErrorBoundary>
              } />
              <Route path="/guide" element={
                <ErrorBoundary pageName="System Guide"><SystemGuide /></ErrorBoundary>
              } />
              <Route path="/about" element={
                <ErrorBoundary pageName="About"><About /></ErrorBoundary>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </WakeUpScreen>
  );
}

export default App;
