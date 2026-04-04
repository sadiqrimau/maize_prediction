import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Award, BarChart2, AlertCircle } from 'lucide-react';
import { api, type ModelStats } from '../utils/api';

const MODEL_DISPLAY: Record<string, { name: string; short: string; desc: string }> = {
  svr:   { name: 'Support Vector Regression', short: 'SVR',          desc: 'Kernel-based regression with excellent non-linear boundary detection' },
  rf:    { name: 'Random Forest',             short: 'Random Forest', desc: 'Ensemble of decision trees with bootstrap aggregation' },
  arima: { name: 'ARIMA',                     short: 'ARIMA',         desc: 'Auto-regressive integrated moving average time-series model' },
  lstm:  { name: 'LSTM Neural Network',       short: 'LSTM',          desc: 'Long Short-Term Memory deep learning sequence model' },
};

const MapeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest-border rounded-lg px-4 py-3 shadow-card text-sm">
      <p className="text-forest-muted font-medium mb-1">{label}</p>
      <p className="text-forest-dark font-bold">{Number(payload[0].value).toFixed(2)}% MAPE</p>
    </div>
  );
};

export function ModelPerformance() {
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModelStats()
      .then((data) => { setModelStats(data); setError(null); })
      .catch(() => setError('Unable to load model statistics. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const bestModel = modelStats.length
    ? modelStats.reduce((best, cur) => (cur.mape < best.mape ? cur : best))
    : null;

  const displayName = (model: string) =>
    MODEL_DISPLAY[model.toLowerCase()]?.name ?? model;

  const shortName = (model: string) =>
    MODEL_DISPLAY[model.toLowerCase()]?.short ?? model;

  const mapeChartData = modelStats.map((s) => ({
    name: shortName(s.model),
    mape: parseFloat(s.mape.toFixed(2)),
    isBest: bestModel?.model.toLowerCase() === s.model.toLowerCase(),
  }));

  return (
    <div className="page-enter min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-white border-b border-forest-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center">
              <BarChart2 size={16} className="text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-dark">Model Performance</h1>
          </div>
          <p className="text-sm text-forest-muted ml-11">
            Comparative evaluation of four ML algorithms on Adamawa State maize price data.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
            <p className="text-sm text-forest-muted">Loading model statistics…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && modelStats.length > 0 && (
          <>
            {/* Winner banner */}
            {bestModel && (
              <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="bg-hero-gradient px-7 py-5 flex items-center gap-4 sm:min-w-[220px]">
                    <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center badge-best">
                      <Award size={22} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-0.5">Top Performer</p>
                      <p className="text-white font-bold text-xl font-display leading-tight">
                        {shortName(bestModel.model)}
                      </p>
                    </div>
                  </div>
                  <div className="px-7 py-5 flex flex-wrap gap-8 items-center">
                    <div>
                      <p className="text-xs text-forest-muted uppercase tracking-widest font-medium mb-1">MAPE</p>
                      <p className="text-2xl font-bold text-forest-dark font-display">{bestModel.mape.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-forest-muted uppercase tracking-widest font-medium mb-1">MAE</p>
                      <p className="text-2xl font-bold text-forest-dark font-display">{bestModel.mae.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-forest-muted uppercase tracking-widest font-medium mb-1">RMSE</p>
                      <p className="text-2xl font-bold text-forest-dark font-display">{bestModel.rmse.toFixed(0)}</p>
                    </div>
                    <div className="max-w-xs">
                      <p className="text-xs text-forest-muted leading-relaxed">
                        {MODEL_DISPLAY[bestModel.model.toLowerCase()]?.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison table */}
            <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-forest-border">
                <h2 className="font-display text-lg font-bold text-forest-dark">Full Comparison</h2>
                <p className="text-xs text-forest-muted mt-0.5">Lower values indicate better model accuracy</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-forest-50 border-b border-forest-border">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-forest-muted uppercase tracking-widest">Model</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-forest-muted uppercase tracking-widest">MAE ↓</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-forest-muted uppercase tracking-widest">RMSE ↓</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-forest-muted uppercase tracking-widest">MAPE % ↓</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-forest-muted uppercase tracking-widest">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-border">
                    {[...modelStats]
                      .sort((a, b) => a.mape - b.mape)
                      .map((stat, idx) => {
                        const isBest = bestModel?.model.toLowerCase() === stat.model.toLowerCase();
                        return (
                          <tr
                            key={stat.model}
                            className={`table-row-hover ${isBest ? 'bg-forest-50' : 'bg-white'}`}
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-forest-dark">
                                    {shortName(stat.model)}
                                  </span>
                                  {isBest && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-[10px] font-semibold text-gold-dark uppercase tracking-wide">
                                      <Award size={9} /> Best
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-forest-muted mt-0.5">{displayName(stat.model)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-sm text-forest-dark">{stat.mae.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-sm text-forest-dark">{stat.rmse.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-forest-100 overflow-hidden hidden sm:block">
                                  <div
                                    className={`h-full rounded-full ${isBest ? 'bg-forest' : 'bg-forest-300'}`}
                                    style={{ width: `${Math.min((stat.mape / 40) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className={`font-mono text-sm font-semibold ${isBest ? 'text-forest' : 'text-forest-dark'}`}>
                                  {stat.mape.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto
                                ${idx === 0 ? 'bg-gold text-white' : 'bg-forest-100 text-forest-muted'}`}>
                                {idx + 1}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MAPE bar chart */}
            <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden chart-enter">
              <div className="px-6 pt-5 pb-4 border-b border-forest-border">
                <h2 className="font-display text-lg font-bold text-forest-dark">MAPE Comparison</h2>
                <p className="text-xs text-forest-muted mt-0.5">Mean Absolute Percentage Error — lower is better</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={mapeChartData} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                    />
                    <Tooltip content={<MapeTooltip />} />
                    <Bar dataKey="mape" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {mapeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isBest ? '#1a5c2a' : '#a8d4b2'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-forest-muted justify-center">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-forest inline-block" /> Best model</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-forest-200 inline-block" /> Other models</span>
                </div>
              </div>
            </div>

            {/* Metric definitions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: 'MAE', full: 'Mean Absolute Error', desc: 'Average of absolute differences between predicted and actual prices. Expressed in NGN per 100 kg.' },
                { metric: 'RMSE', full: 'Root Mean Square Error', desc: 'Square root of average squared errors. Penalises large errors more heavily than MAE.' },
                { metric: 'MAPE', full: 'Mean Absolute % Error', desc: 'Average percentage deviation from actual prices. Scale-independent and used here for model selection.' },
              ].map((m) => (
                <div key={m.metric} className="bg-white rounded-xl border border-forest-border p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-forest text-sm bg-forest-50 px-2 py-0.5 rounded">{m.metric}</span>
                    <span className="text-xs text-forest-muted">{m.full}</span>
                  </div>
                  <p className="text-xs text-forest-muted leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
