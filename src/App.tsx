import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Forecaster } from './pages/Forecaster';
import { ModelPerformance } from './pages/ModelPerformance';
import { About } from './pages/About';
import { api } from './utils/api';

const WAKEUP_THRESHOLD_MS = 3000; // show banner after this long

function WakeupBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm"
      style={{ animation: 'slideDown 0.25s ease-out both' }}
    >
      <span className="inline-flex items-center gap-2 text-amber-800">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin inline-block" />
        <span>
          <strong>API server is waking up</strong> from sleep mode — this takes 30–60 seconds on first load.
          Data will appear automatically once ready.
        </span>
      </span>
    </div>
  );
}

function App() {
  const [showWakeupBanner, setShowWakeupBanner] = useState(false);

  useEffect(() => {
    // Start a timer — if the ping takes longer than the threshold, show the banner
    const timer = setTimeout(() => setShowWakeupBanner(true), WAKEUP_THRESHOLD_MS);

    api.ping().finally(() => {
      clearTimeout(timer);
      setShowWakeupBanner(false);
    });

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-cream font-sans">
        <Navigation />
        <WakeupBanner visible={showWakeupBanner} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecaster" element={<Forecaster />} />
            <Route path="/performance" element={<ModelPerformance />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
