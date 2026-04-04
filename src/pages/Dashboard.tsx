import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Database, Calendar, TrendingUp, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { api, HistoricalDataPoint } from '../utils/api';

/* ── Custom tooltip components ─────────────────────── */
const PriceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest-border rounded-lg px-4 py-3 shadow-card text-sm">
      <p className="text-forest-muted font-medium mb-1">{label}</p>
      <p className="text-forest-dark font-bold text-base">
        ₦{Number(payload[0].value).toLocaleString()}
      </p>
      <p className="text-forest-muted text-xs">per 100 kg</p>
    </div>
  );
};

const SeasonalTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest-border rounded-lg px-4 py-3 shadow-card text-sm">
      <p className="text-forest-muted font-medium mb-1">{label} (avg.)</p>
      <p className="font-bold text-base" style={{ color: '#c9a84c' }}>
        ₦{Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

export function Dashboard() {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getHistoricalData()
      .then((data) => { setHistoricalData(data); setError(null); })
      .catch(() => setError('Unable to load historical data. The API server may still be waking up — please retry.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Chart data helpers ─────────────────────────── */
  const chartData = historicalData.map((item) => ({
    date: new Date(item.Date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    price: item.Price,
    fullDate: item.Date,
  }));

  const seasonalData = (() => {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const buckets: { [k: number]: number[] } = {};
    historicalData.forEach((d) => {
      const m = new Date(d.Date).getMonth();
      if (!buckets[m]) buckets[m] = [];
      buckets[m].push(d.Price);
    });
    return names.map((name, i) => ({
      month: name,
      avgPrice: buckets[i]?.length
        ? Math.round(buckets[i].reduce((a, b) => a + b, 0) / buckets[i].length)
        : null,
    })).filter((d) => d.avgPrice !== null);
  })();

  const dateRange = (() => {
    if (!historicalData.length) return '—';
    const dates = historicalData.map((d) => new Date(d.Date).getTime());
    const fmt = (t: number) =>
      new Date(t).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${fmt(Math.min(...dates))} – ${fmt(Math.max(...dates))}`;
  })();

  /* ── X-axis tick: show every 12th label to reduce clutter ── */
  const tickFormatter = (_: string, index: number) =>
    index % 12 === 0 ? chartData[index]?.date ?? '' : '';

  return (
    <div className="page-enter">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero-grain bg-hero-gradient text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/80 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Live Data Feed
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-none mb-3">
                IMTISAL
                <span className="block text-lg md:text-xl font-normal text-white/70 mt-2 font-sans tracking-normal">
                  Intelligent Maize Trade Information System
                </span>
              </h1>
              <p className="text-white/60 text-sm max-w-lg leading-relaxed">
                Machine-learning price forecasting for Adamawa State, Nigeria — integrating climate,
                market, and satellite data since 2016.
              </p>
            </div>
            <div className="flex items-center gap-3 md:pb-1">
              <span className="text-4xl">🇳🇬</span>
              <div className="text-right">
                <div className="text-white font-semibold text-sm">Adamawa State</div>
                <div className="text-white/50 text-xs">North-East Nigeria</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Stats row ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Records"
            value={loading ? '…' : historicalData.length || 106}
            icon={Database}
            subtitle="Monthly observations"
            delay={0}
          />
          <StatsCard
            title="Date Range"
            value={loading ? '…' : dateRange}
            icon={Calendar}
            subtitle="Training data window"
            delay={80}
          />
          <StatsCard
            title="Best Model"
            value="SVM"
            icon={TrendingUp}
            subtitle="Support Vector Machine"
            delay={160}
          />
          <StatsCard
            title="Best MAPE"
            value="15.7%"
            icon={Target}
            subtitle="Mean Absolute % Error"
            delay={240}
          />
        </div>

        {/* ── Historical price chart ─────────────────── */}
        <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden chart-enter">
          <div className="px-6 pt-6 pb-4 border-b border-forest-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-forest-dark">Historical Maize Prices</h2>
              <p className="text-sm text-forest-muted mt-0.5">Adamawa State market data · NGN per 100 kg</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-forest-muted">
                <span className="w-6 h-0.5 bg-forest rounded-full inline-block" />
                Market price
              </span>
              <span className="flex items-center gap-1.5 text-forest-muted">
                <span className="w-6 h-0.5 border-t-2 border-dashed border-gold inline-block" />
                2023 break
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading && (
              <div className="space-y-3" aria-label="Loading chart">
                {/* Y-axis + line skeleton */}
                <div className="flex items-end gap-1 h-72">
                  <div className="flex flex-col justify-between h-full py-2 w-10 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="skeleton h-3 w-8 rounded" />
                    ))}
                  </div>
                  <div className="flex-1 h-full flex items-end gap-1">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="skeleton flex-1 rounded-t"
                        style={{ height: `${30 + Math.sin(i * 0.7) * 20 + Math.random() * 20}%` }}
                      />
                    ))}
                  </div>
                </div>
                {/* X-axis labels */}
                <div className="flex gap-1 pl-11">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-3 flex-1 rounded" />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium">Data unavailable</p>
                  <p className="text-amber-700 mt-0.5">{error}</p>
                  <button
                    onClick={loadData}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold transition-colors duration-150"
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={tickFormatter}
                    tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<PriceTooltip />} />
                  <ReferenceLine
                    x="Jan '23"
                    stroke="#c9a84c"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: '2023 break', position: 'insideTopRight', fontSize: 10, fill: '#c9a84c' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1a5c2a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#1a5c2a', strokeWidth: 2, stroke: '#fff' }}
                    name="Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Seasonal pattern chart ─────────────────── */}
        <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden chart-enter">
          <div className="px-6 pt-6 pb-4 border-b border-forest-border">
            <h2 className="font-display text-xl font-bold text-forest-dark">Seasonal Price Pattern</h2>
            <p className="text-sm text-forest-muted mt-0.5">Average maize price by calendar month · NGN per 100 kg</p>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex items-end gap-2 h-56" aria-label="Loading seasonal chart">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton flex-1 rounded-t"
                    style={{ height: `${40 + Math.sin(i * 0.5) * 25 + 15}%` }}
                  />
                ))}
              </div>
            )}

            {!loading && !error && seasonalData.length > 0 && (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={seasonalData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#5a7a5e', fontFamily: 'IBM Plex Sans' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<SeasonalTooltip />} />
                  <Bar dataKey="avgPrice" fill="#c9a84c" radius={[4, 4, 0, 0]} maxBarSize={40} name="Avg Price" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Source note ────────────────────────────── */}
        <p className="text-xs text-forest-muted text-center pb-6">
          Data sources: FEWS NET · NASA POWER · NFPT &nbsp;|&nbsp; Prices in Nigerian Naira (NGN) &nbsp;|&nbsp; 100 kg unit
        </p>
      </div>
    </div>
  );
}
