import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Forecaster } from './pages/Forecaster';
import { ModelPerformance } from './pages/ModelPerformance';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream font-sans">
        <Navigation />
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
