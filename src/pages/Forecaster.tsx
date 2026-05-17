import { useState, useEffect, type FormEvent } from 'react';
import {
  TrendingUp, Cloud, Droplets, Thermometer, Calendar,
  ChevronDown, Sparkles, AlertCircle, Info, RefreshCw, MapPin,
} from 'lucide-react';
import { api, type PredictionRequest } from '../utils/api';
import { fetchCurrentMonthWeather } from '../utils/weather';

/* ── Model option card ──────────────────────────── */
function ModelCard({
  label, description, recommended, selected, onClick,
}: {
  value: string;
  label: string;
  description: string;
  recommended?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
        selected
          ? 'border-forest bg-forest-50 shadow-sm'
          : 'border-forest-border bg-white hover:border-forest-200 hover:bg-forest-50/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${selected ? 'text-forest-dark' : 'text-gray-700'}`}>
              {label}
            </span>
            {recommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-dark text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles size={9} /> Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-forest-muted mt-1">{description}</p>
        </div>
        <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 transition-colors duration-150 ${
          selected ? 'border-forest bg-forest' : 'border-gray-300'
        }`}>
          {selected && <span className="block w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5" />}
        </div>
      </div>
    </button>
  );
}

/* ── Labelled input ─────────────────────────────── */
function InputField({
  label, icon: Icon, children, hint,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-forest-dark mb-1.5">
        <span className="flex items-center gap-1.5">
          <Icon size={14} className="text-forest" />
          {label}
        </span>
      </label>
      {children}
      {hint && <p className="text-xs text-forest-muted mt-1">{hint}</p>}
    </div>
  );
}

/* ── Models config ──────────────────────────────── */
const MODELS = [
  { value: 'svm',   label: 'SVM',           description: 'Support Vector Machine — best performer (15.7% MAPE)', recommended: true  },
  { value: 'rf',    label: 'Random Forest',  description: 'Ensemble of decision trees, robust to outliers',         recommended: false },
  { value: 'arima', label: 'ARIMA',          description: 'Classical time-series model, strong seasonality capture', recommended: false },
  { value: 'lstm',  label: 'LSTM',           description: 'Deep learning RNN, learns long-range dependencies',       recommended: false },
];

type WeatherStatus = 'idle' | 'loading' | 'loaded' | 'error';

export function Forecaster() {
  const [form, setForm] = useState<PredictionRequest>({
    month:         new Date().getMonth() + 1,
    cloud_amount:  50,
    precipitation: 100,
    temperature:   28,
    model:         'svm',
  });
  const [prediction,     setPrediction]     = useState<{ price: number; model: string } | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [weatherStatus,  setWeatherStatus]  = useState<WeatherStatus>('idle');
  const [weatherLabel,   setWeatherLabel]   = useState<string>('');

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  // Auto-fetch weather on first load
  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setWeatherStatus('loading');
    try {
      const w = await fetchCurrentMonthWeather();
      setForm((prev) => ({
        ...prev,
        month:         w.month,
        cloud_amount:  w.cloud_amount,
        precipitation: w.precipitation,
        temperature:   w.temperature,
      }));
      setWeatherLabel(w.label);
      setWeatherStatus('loaded');
    } catch {
      setWeatherStatus('error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await api.predictPrice(form);
      setPrediction({ price: result.predicted_price, model: result.model_used });
    } catch {
      setError('Prediction failed after 3 attempts. If the server just woke up, wait 30 seconds and try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof PredictionRequest>(key: K, value: PredictionRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="page-enter min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-white border-b border-forest-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-dark">Price Forecaster</h1>
          </div>
          <p className="text-sm text-forest-muted ml-11">
            Climate parameters are auto-filled from live weather data for Adamawa State. You can adjust them manually.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Input form ───────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Weather status banner */}
            <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${
              weatherStatus === 'loaded'
                ? 'bg-forest-50 border-forest-100 text-forest-dark'
                : weatherStatus === 'loading'
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : weatherStatus === 'error'
                ? 'bg-red-50 border-red-100 text-red-700'
                : 'bg-gray-50 border-gray-100 text-gray-500'
            }`}>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="text-xs font-medium">
                  {weatherStatus === 'loading' && 'Fetching live weather for Yola, Adamawa…'}
                  {weatherStatus === 'loaded'  && weatherLabel}
                  {weatherStatus === 'error'   && 'Could not fetch live weather — using default values'}
                  {weatherStatus === 'idle'    && 'Weather data not yet loaded'}
                </span>
                {weatherStatus === 'loading' && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                )}
              </div>
              <button
                type="button"
                onClick={fetchWeather}
                disabled={weatherStatus === 'loading'}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg
                           bg-white border border-forest-border text-forest
                           hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors duration-150 flex-shrink-0"
              >
                <RefreshCw size={12} className={weatherStatus === 'loading' ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Environmental inputs */}
              <div className="bg-white rounded-2xl border border-forest-border shadow-card p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-forest-dark border-b border-forest-border pb-3">
                  Climate Parameters
                </h2>

                <InputField label="Month" icon={Calendar} hint="Select the month to predict prices for">
                  <div className="relative">
                    <select
                      value={form.month}
                      onChange={(e) => set('month', parseInt(e.target.value))}
                      className="w-full appearance-none px-4 py-2.5 border border-forest-border rounded-xl bg-white text-sm text-forest-dark focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-shadow"
                      required
                    >
                      {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-muted pointer-events-none" />
                  </div>
                </InputField>

                <InputField
                  label={`Cloud Cover — ${form.cloud_amount}%`}
                  icon={Cloud}
                  hint="Fraction of sky covered by clouds (0 – 100%)"
                >
                  <input
                    type="range"
                    min={0} max={100} step={1}
                    value={form.cloud_amount}
                    onChange={(e) => set('cloud_amount', parseFloat(e.target.value))}
                    className="w-full h-2 bg-forest-100 rounded-full appearance-none cursor-pointer accent-forest"
                  />
                  <div className="flex justify-between text-xs text-forest-muted mt-1">
                    <span>0% Clear</span><span>100% Overcast</span>
                  </div>
                </InputField>

                <InputField
                  label={`Precipitation — ${form.precipitation} mm`}
                  icon={Droplets}
                  hint="Total monthly rainfall in millimetres"
                >
                  <input
                    type="range"
                    min={0} max={400} step={5}
                    value={form.precipitation}
                    onChange={(e) => set('precipitation', parseFloat(e.target.value))}
                    className="w-full h-2 bg-forest-100 rounded-full appearance-none cursor-pointer accent-forest"
                  />
                  <div className="flex justify-between text-xs text-forest-muted mt-1">
                    <span>0 mm</span><span>400 mm</span>
                  </div>
                </InputField>

                <InputField
                  label={`Temperature — ${form.temperature} °C`}
                  icon={Thermometer}
                  hint="Average monthly temperature in degrees Celsius"
                >
                  <input
                    type="range"
                    min={15} max={45} step={0.5}
                    value={form.temperature}
                    onChange={(e) => set('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-forest-100 rounded-full appearance-none cursor-pointer accent-forest"
                  />
                  <div className="flex justify-between text-xs text-forest-muted mt-1">
                    <span>15 °C</span><span>45 °C</span>
                  </div>
                </InputField>
              </div>

              {/* Model selector */}
              <div className="bg-white rounded-2xl border border-forest-border shadow-card p-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-forest-dark border-b border-forest-border pb-3">
                  Prediction Model
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODELS.map((m) => (
                    <ModelCard
                      key={m.value}
                      {...m}
                      selected={form.model === m.value}
                      onClick={() => set('model', m.value)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-forest text-white rounded-xl font-semibold text-sm tracking-wide
                           hover:bg-forest-dark active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-150 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating forecast…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <TrendingUp size={16} />
                    Generate Price Forecast
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ── Results panel ────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tip card */}
            <div className="bg-forest-50 border border-forest-100 rounded-2xl p-5">
              <div className="flex gap-3">
                <Info size={16} className="text-forest flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-forest-dark mb-1">How it works</p>
                  <p className="text-xs text-forest-muted leading-relaxed">
                    Climate inputs are automatically filled using live weather data from
                    Open-Meteo for Yola, Adamawa State. You can override any value manually
                    before generating a forecast. SVM is recommended — it achieved 15.7% MAPE.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-sm">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Prediction failed</p>
                  <p className="text-red-700 mt-0.5 text-xs leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {prediction && (
              <div className="prediction-reveal bg-white rounded-2xl border-2 border-forest overflow-hidden shadow-card">
                <div className="bg-hero-gradient px-6 py-5">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Predicted Price</p>
                  <div className="text-5xl font-bold text-white font-display leading-none">
                    ₦{prediction.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-white/60 text-sm mt-2">NGN per kg of maize</p>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-muted">Model used</span>
                    <span className="font-semibold text-forest-dark uppercase">{prediction.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-muted">Month</span>
                    <span className="font-semibold text-forest-dark">{months[form.month - 1]}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-muted">Cloud cover</span>
                    <span className="font-semibold text-forest-dark">{form.cloud_amount}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-muted">Precipitation</span>
                    <span className="font-semibold text-forest-dark">{form.precipitation} mm</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-muted">Temperature</span>
                    <span className="font-semibold text-forest-dark">{form.temperature} °C</span>
                  </div>
                  <div className="pt-3 mt-1 border-t border-forest-border">
                    <p className="text-xs text-forest-muted leading-relaxed">
                      <strong className="text-forest-dark">Disclaimer:</strong> This forecast is based on
                      historical patterns. Actual prices may vary due to market shocks, policy changes,
                      and the 2023 structural break in Nigeria's food economy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no result */}
            {!prediction && !loading && !error && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-forest-border p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={24} className="text-forest-300" />
                </div>
                <p className="text-sm font-medium text-forest-muted">Your prediction will appear here</p>
                <p className="text-xs text-forest-muted/70 mt-1">Fill in the parameters and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
