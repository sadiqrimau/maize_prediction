import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CheckCircle, AlertCircle, RefreshCw, FlaskConical } from 'lucide-react';
import { api, type ValidationPoint, type ValidationAllPoint } from '../utils/api';

/* ── Tooltips ─────────────────────────────────────────── */
const ValTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest-border rounded-lg px-4 py-3 shadow-card text-sm min-w-[170px]">
      <p className="text-forest-muted font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-forest-dark text-xs">
            ₦{Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Skeleton ─────────────────────────────────────────── */
function ChartSkeleton() {
  return (
    <div className="space-y-3 p-6" aria-label="Loading chart">
      <div className="flex items-end gap-1 h-64">
        <div className="flex flex-col justify-between h-full py-2 w-10 flex-shrink-0">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-3 w-8 rounded" />)}
        </div>
        <div className="flex-1 relative h-full">
          <div className="skeleton h-full w-full rounded" style={{ opacity: 0.3 }} />
        </div>
      </div>
      <div className="flex gap-1 pl-11">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-3 flex-1 rounded" />)}
      </div>
    </div>
  );
}

/* ── Error card ───────────────────────────────────────── */
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm">
      <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-red-800">Failed to load validation data</p>
        <p className="text-red-700 mt-0.5">{message}</p>
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors duration-150"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </div>
  );
}

/* ── MAPE badge ───────────────────────────────────────── */
const MODEL_COLORS: Record<string, string> = {
  actual: '#1a5c2a',
  svm:    '#c9a84c',
  rf:     '#4e9af1',
  arima:  '#e07b54',
  lstm:   '#a855f7',
};

const MODEL_MAPE: Record<string, number> = {
  svm: 15.7, rf: 36.1, arima: 36.0, lstm: 39.5,
};

export function Validation() {
  const [svmData, setSvmData]   = useState<ValidationPoint[]>([]);
  const [allData, setAllData]   = useState<ValidationAllPoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.getValidation(), api.getValidationAll()])
      .then(([svm, all]) => { setSvmData(svm); setAllData(all); })
      .catch(() => setError('Unable to load validation data. The server may be waking up — please retry.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const formatDate = (d: string) => {
    const [y, m] = d.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  };

  const svmChartData = svmData.map(d => ({
    date: formatDate(d.date),
    actual: d.actual_price,
    predicted: d.predicted_price,
  }));

  const allChartData = allData.map(d => ({
    date: formatDate(d.date),
    actual: d.actual_price,
    SVM:   d.svm,
    RF:    d.rf,
    ARIMA: d.arima,
    LSTM:  d.lstm,
  }));

  return (
    <div className="page-enter min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-forest-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center">
              <FlaskConical size={16} className="text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-dark">Model Validation</h1>
          </div>
          <p className="text-sm text-forest-muted ml-11">
            Out-of-sample test period: November 2022 – May 2024 · Actual vs. predicted prices
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {error && <ErrorCard message={error} onRetry={loadData} />}

        {/* ── SVM chart ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden chart-enter">
          <div className="px-6 pt-6 pb-4 border-b border-forest-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-forest-dark">SVM — Actual vs. Predicted</h2>
              <p className="text-sm text-forest-muted mt-0.5">Test period 2022-11 to 2024-05 · NGN per kg</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-forest-muted">
                <span className="w-6 h-0.5 rounded-full inline-block" style={{ background: MODEL_COLORS.actual }} />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-forest-muted">
                <span className="w-6 h-0.5 border-t-2 border-dashed inline-block" style={{ borderColor: MODEL_COLORS.svm }} />
                SVM Predicted
              </span>
            </div>
          </div>

          {loading ? <ChartSkeleton /> : (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={svmChartData} margin={{ top: 4, right: 16, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ValTooltip />} />
                  <Line type="monotone" dataKey="actual"    stroke={MODEL_COLORS.actual} strokeWidth={2.5} dot={{ r: 3, fill: MODEL_COLORS.actual }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke={MODEL_COLORS.svm}    strokeWidth={2} strokeDasharray="5 3" dot={false} name="SVM Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── SVM summary card ────────────────────────── */}
        <div className="bg-white rounded-2xl border-2 border-forest shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="bg-hero-gradient px-6 py-5 sm:min-w-[200px] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center">
                <CheckCircle size={22} className="text-gold" />
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-0.5">SVM Test Result</p>
                <p className="text-white font-bold text-3xl font-display">15.7%</p>
                <p className="text-white/60 text-xs mt-0.5">MAPE</p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col justify-center gap-1">
              <p className="text-forest-dark font-semibold text-sm">
                SVM achieved <strong>15.7% MAPE</strong> on the November 2022 – May 2024 hold-out test set
              </p>
              <p className="text-forest-muted text-xs leading-relaxed">
                This outperforms Random Forest (36.1%), ARIMA (36.0%), and LSTM (39.5%) by more than 2×.
                The SVM with linear kernel is the recommended production model for this dataset.
              </p>
            </div>
          </div>
        </div>

        {/* ── All models chart ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden chart-enter">
          <div className="px-6 pt-6 pb-4 border-b border-forest-border">
            <h2 className="font-display text-xl font-bold text-forest-dark">All Models — Actual vs. Predicted</h2>
            <p className="text-sm text-forest-muted mt-0.5">Comparison of all 4 models over the test period · NGN per kg</p>
          </div>

          {loading ? <ChartSkeleton /> : (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={allChartData} margin={{ top: 4, right: 16, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ValTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Line type="monotone" dataKey="actual" stroke={MODEL_COLORS.actual} strokeWidth={2.5} dot={{ r: 3 }} name="Actual" />
                  <Line type="monotone" dataKey="SVM"   stroke={MODEL_COLORS.svm}   strokeWidth={2}   strokeDasharray="5 3" dot={false} name="SVM" />
                  <Line type="monotone" dataKey="RF"    stroke={MODEL_COLORS.rf}    strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Random Forest" />
                  <Line type="monotone" dataKey="ARIMA" stroke={MODEL_COLORS.arima} strokeWidth={1.5} strokeDasharray="3 5" dot={false} name="ARIMA" />
                  <Line type="monotone" dataKey="LSTM"  stroke={MODEL_COLORS.lstm}  strokeWidth={1.5} strokeDasharray="2 4" dot={false} name="LSTM" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── MAPE summary grid ─────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: 'svm',   label: 'SVM',          best: true },
            { key: 'rf',    label: 'Random Forest', best: false },
            { key: 'arima', label: 'ARIMA',         best: false },
            { key: 'lstm',  label: 'LSTM',          best: false },
          ].map(({ key, label, best }) => (
            <div key={key} className={`rounded-xl border p-4 ${best ? 'bg-forest-50 border-forest-200' : 'bg-white border-forest-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-forest-muted uppercase tracking-wide">{label}</span>
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: MODEL_COLORS[key] }} />
              </div>
              <div className={`text-2xl font-bold font-display ${best ? 'text-forest' : 'text-forest-dark'}`}>
                {MODEL_MAPE[key]}%
              </div>
              <div className="text-xs text-forest-muted mt-0.5">MAPE</div>
              {best && (
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gold-dark bg-gold-50 border border-gold-100 px-2 py-0.5 rounded-full inline-block">
                  ★ Best
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-forest-muted text-center pb-6">
          Test period: November 2022 – May 2024 · 19 monthly observations · All models trained on 2015-01 to 2022-10
        </p>
      </div>
    </div>
  );
}
