import { Info, Database, AlertTriangle, Cpu, Users, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="page-enter min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-white border-b border-forest-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center">
              <Info size={16} className="text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-dark">About IMTISAL</h1>
          </div>
          <p className="text-sm text-forest-muted ml-11">
            Project background, methodology, and data source documentation.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Overview ─────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden">
          <div className="bg-hero-grain bg-hero-gradient px-8 py-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Intelligent Maize Trade Information System
              <span className="block text-base font-normal text-white/60 mt-1 font-sans">for Adamawa Localities</span>
            </h2>
          </div>
          <div className="px-8 py-6 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              IMTISAL is a machine learning–based price forecasting system designed to predict maize
              market prices in Adamawa State, North-East Nigeria. By combining historical market price
              data with satellite-derived climate variables, the system provides data-driven forecasts
              that support evidence-based decisions in agricultural markets.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              The system is designed to serve farmers, commodity traders, NGOs, and government
              policymakers seeking advance price intelligence ahead of planting, storage, and
              distribution decisions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {[
                { label: 'Records', value: '106' },
                { label: 'Time span', value: '2016–2026' },
                { label: 'Models', value: '4' },
                { label: 'Best MAPE', value: '15.7%' },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-forest-50 rounded-xl border border-forest-100">
                  <div className="font-display text-2xl font-bold text-forest">{s.value}</div>
                  <div className="text-xs text-forest-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Data Sources ──────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-forest" />
            <h2 className="font-display text-xl font-bold text-forest-dark">Data Sources</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                acronym: 'FEWS NET',
                name: 'Famine Early Warning Systems Network',
                url: 'fews.net',
                color: 'bg-blue-50 border-blue-200',
                badge: 'bg-blue-100 text-blue-700',
                desc: 'Primary source of historical maize retail prices for Adamawa State markets. FEWS NET provides monthly market monitoring data across food-insecure regions of sub-Saharan Africa, including Nigeria\'s north-east.',
                type: 'Price data',
              },
              {
                acronym: 'NASA POWER',
                name: 'Prediction of Worldwide Energy Resources',
                url: 'power.larc.nasa.gov',
                color: 'bg-purple-50 border-purple-200',
                badge: 'bg-purple-100 text-purple-700',
                desc: 'Satellite-derived climate reanalysis data providing monthly temperature, precipitation, and cloud cover for the Adamawa State region. These variables are used as predictive features in all four ML models.',
                type: 'Climate data',
              },
              {
                acronym: 'NFPT',
                name: 'Nigeria Food Price Tracker',
                url: 'Nigeria NBS',
                color: 'bg-green-50 border-green-200',
                badge: 'bg-green-100 text-green-700',
                desc: 'Supplementary national food commodity price data used to cross-validate model outputs and provide context on broader price dynamics within Nigeria\'s food supply chains.',
                type: 'Validation data',
              },
            ].map((src) => (
              <div key={src.acronym} className={`rounded-xl border ${src.color} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${src.badge} font-mono font-bold text-sm`}>
                    {src.acronym}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{src.name}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Globe size={11} />
                        {src.url}
                      </span>
                      <span className="ml-auto text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {src.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{src.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ML Models ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-forest" />
            <h2 className="font-display text-xl font-bold text-forest-dark">Machine Learning Models</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                short: 'SVR',
                name: 'Support Vector Regression',
                best: true,
                desc: 'Uses kernel functions to map inputs into high-dimensional feature space, enabling effective modelling of non-linear price relationships. Best performer at 15.7% MAPE.',
                detail: '15.7% MAPE · Recommended',
              },
              {
                short: 'RF',
                name: 'Random Forest',
                best: false,
                desc: 'Bootstrap aggregation of multiple decision trees. Robust to overfitting and handles missing data well. Provides feature importance rankings for interpretability.',
                detail: 'Ensemble · High robustness',
              },
              {
                short: 'ARIMA',
                name: 'Auto-Regressive Integrated Moving Average',
                best: false,
                desc: 'Classical statistical time-series model that captures auto-correlation, trends, and seasonality. Provides a strong baseline for comparison with ML methods.',
                detail: 'Time-series · Seasonality',
              },
              {
                short: 'LSTM',
                name: 'Long Short-Term Memory Network',
                best: false,
                desc: 'Deep learning recurrent neural network with gated memory cells. Designed to learn long-range dependencies in sequential data — useful for multi-year price cycles.',
                detail: 'Deep learning · Sequential',
              },
            ].map((m) => (
              <div
                key={m.short}
                className={`rounded-xl border p-5 ${m.best ? 'bg-forest-50 border-forest-200' : 'bg-white border-forest-border'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                    m.best ? 'bg-forest text-white' : 'bg-forest-100 text-forest'
                  }`}>
                    {m.short}
                  </span>
                  {m.best && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gold-dark bg-gold-50 border border-gold-100 px-2 py-0.5 rounded-full">
                      ★ Best
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-forest-dark mb-1">{m.name}</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{m.desc}</p>
                <p className="text-xs text-forest font-medium">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Limitations ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-display text-xl font-bold text-forest-dark">Limitations & Considerations</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50">
              <p className="text-sm font-semibold text-amber-800">
                Users should combine IMTISAL outputs with local knowledge and current market intelligence.
              </p>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  title: 'Single-Market Coverage',
                  body: 'Training data derives primarily from specific monitored markets in Adamawa State. Price dynamics in unmonitored rural markets, cross-border trade zones, and informal settlements may deviate substantially from model outputs.',
                },
                {
                  title: '2023 Structural Break',
                  body: 'A documented structural break in Nigeria\'s food economy occurred in 2023, driven by currency devaluation, fuel subsidy removal, and logistics disruptions. Models trained on pre-2023 data have reduced predictive validity for the post-break regime.',
                },
                {
                  title: 'External Shock Blindness',
                  body: 'The model does not incorporate real-time signals for political instability, Boko Haram-related market disruptions, sudden policy interventions, or global commodity price shocks that can dominate short-term prices.',
                },
                {
                  title: 'Model Temporal Decay',
                  body: 'As market structures evolve, model accuracy will degrade without periodic retraining on updated data. MAPE figures reported reflect in-sample validation performance and may not generalise to distant future periods.',
                },
              ].map((lim) => (
                <div key={lim.title} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">{lim.title}</p>
                    <p className="text-sm text-amber-800 leading-relaxed mt-0.5">{lim.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stakeholders ──────────────────────────── */}
        <section className="bg-white rounded-2xl border border-forest-border shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={16} className="text-forest" />
            <h2 className="font-display text-lg font-bold text-forest-dark">Intended Users</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🌾', role: 'Smallholder Farmers', note: 'Planting & storage timing' },
              { icon: '📦', role: 'Commodity Traders', note: 'Procurement decisions' },
              { icon: '🏛️', role: 'Government Agencies', note: 'Food security policy' },
              { icon: '🤝', role: 'Humanitarian NGOs', note: 'Early warning response' },
            ].map((u) => (
              <div key={u.role} className="text-center p-4 bg-forest-50 rounded-xl border border-forest-100">
                <div className="text-2xl mb-2">{u.icon}</div>
                <div className="text-xs font-semibold text-forest-dark">{u.role}</div>
                <div className="text-xs text-forest-muted mt-1">{u.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="text-xs text-forest-muted text-center pb-6 leading-relaxed">
          IMTISAL · Adamawa State Maize Price Prediction System ·{' '}
          Data: FEWS NET, NASA POWER, NFPT · Models trained on 2016–2026 observations
        </p>
      </div>
    </div>
  );
}
