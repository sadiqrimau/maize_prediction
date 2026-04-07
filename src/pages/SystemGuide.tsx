import { BookOpen, Server, Globe, Layers, Lightbulb, Code2, ArrowRight } from 'lucide-react';

/* ── Code block ────────────────────────────────────────── */
function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-900 text-green-300 rounded-xl text-xs p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre">
      {code.trim()}
    </pre>
  );
}

/* ── Section wrapper ────────────────────────────────────── */
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-forest-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-forest" />
        </div>
        <h2 className="font-display text-lg font-bold text-forest-dark">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

/* ── Endpoint card ────────────────────────────────────── */
function EndpointCard({ method, path, desc, request, response }: {
  method: string; path: string; desc: string;
  request?: string; response: string;
}) {
  const bg = method === 'GET' ? 'bg-blue-50 text-blue-700 border-blue-200'
           : method === 'POST' ? 'bg-green-50 text-green-700 border-green-200'
           : 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <div className="rounded-xl border border-forest-border overflow-hidden">
      <div className="px-4 py-3 bg-forest-50 flex flex-wrap items-center gap-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${bg}`}>{method}</span>
        <code className="font-mono text-sm font-semibold text-forest-dark">{path}</code>
        <span className="text-xs text-forest-muted">{desc}</span>
      </div>
      <div className="p-4 space-y-3">
        {request && (
          <div>
            <p className="text-xs font-semibold text-forest-muted uppercase tracking-wide mb-1.5">Request body</p>
            <CodeBlock code={request} />
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-forest-muted uppercase tracking-wide mb-1.5">Example response</p>
          <CodeBlock code={response} />
        </div>
      </div>
    </div>
  );
}

/* ── Stack badge ──────────────────────────────────────── */
function StackBadge({ icon, name, note }: { icon: string; name: string; note: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-forest-50 rounded-xl border border-forest-100">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-forest-dark">{name}</div>
        <div className="text-xs text-forest-muted">{note}</div>
      </div>
    </div>
  );
}

export function SystemGuide() {
  return (
    <div className="page-enter min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-forest-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center">
              <BookOpen size={16} className="text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-dark">System Guide</h1>
          </div>
          <p className="text-sm text-forest-muted ml-11">
            API reference, tech stack, extension guide, and future roadmap for IMTISAL.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── API Endpoints ────────────────────────── */}
        <Section icon={Server} title="API Endpoints">
          <p className="text-sm text-forest-muted mb-4">
            Base URL: <code className="font-mono text-xs bg-forest-50 px-2 py-0.5 rounded text-forest">https://imtisal-maize-api.onrender.com</code>
          </p>
          <div className="space-y-4">

            <EndpointCard
              method="GET" path="/"
              desc="Health check — confirms models are loaded"
              response={`{
  "status": "ok",
  "service": "IMTISAL Maize Price Prediction API",
  "models_loaded": { "svm": true, "rf": true, "arima": true, "lstm": true },
  "historical_rows": 106
}`}
            />

            <EndpointCard
              method="GET" path="/api/historical"
              desc="All historical price records (imputed rows excluded)"
              response={`{
  "total": 106,
  "count": 106,
  "data": [
    { "date": "2015-01-01", "fews_maize_price_ngn_kg": "2020.0",
      "climate_cloud_amt": "19.69", "temp_dbavg_c": "26.8", ... }
  ]
}`}
            />

            <EndpointCard
              method="GET" path="/api/model-stats"
              desc="MAE, RMSE, MAPE for all 4 models"
              response={`{
  "svm":   { "mae_ngn_kg": 3177.78, "rmse_ngn_kg": 3773.47, "mape_pct": 15.73 },
  "rf":    { "mae_ngn_kg": 8410.14, "rmse_ngn_kg": 10474.13, "mape_pct": 36.11 },
  "arima": { "mae_ngn_kg": 8152.58, "rmse_ngn_kg": 10602.48, "mape_pct": 36.03 },
  "lstm":  { "mae_ngn_kg": 8726.45, "rmse_ngn_kg": 11079.55, "mape_pct": 39.47 },
  "best_model": "svm"
}`}
            />

            <EndpointCard
              method="POST" path="/api/predict"
              desc="Predict price for a given month and climate conditions"
              request={`{
  "month": 6,
  "year": 2025,
  "climate_cloud_amt": 55.0,
  "design_avg_precip_mm": 80.0,
  "design_avg_wind_ms": 3.0,
  "temp_dbavg_c": 29.0,
  "use_model": "svm"
}`}
              response={`{
  "model_used": "SVM",
  "target_month": "2025-06",
  "predicted_price_ngn_kg": 23603.22,
  "predicted_price_ngn_bag100kg": 2360322.10,
  "confidence_note": "High confidence — model MAPE=15.7% on test set."
}`}
            />

            <EndpointCard
              method="GET" path="/api/validation"
              desc="SVM predictions vs. actual prices for the 2022–2024 test period"
              response={`[
  { "date": "2022-11", "actual_price": 11276.54,
    "predicted_price": 11480.12, "model": "SVM" },
  ...
]`}
            />

            <EndpointCard
              method="GET" path="/api/validation/all"
              desc="All 4 models' predictions side-by-side for the test period"
              response={`[
  { "date": "2022-11", "actual_price": 11276.54,
    "svm": 11480.12, "rf": 14200.00, "arima": 13100.00, "lstm": 12800.00 },
  ...
]`}
            />
          </div>
        </Section>

        {/* ── Tech stack ──────────────────────────── */}
        <Section icon={Layers} title="Technology Stack">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-forest-muted uppercase tracking-wide mb-2">Backend</p>
              <div className="space-y-2">
                <StackBadge icon="🐍" name="FastAPI (Python)"      note="REST API framework, async, auto OpenAPI docs" />
                <StackBadge icon="🤖" name="scikit-learn"          note="SVM and Random Forest models" />
                <StackBadge icon="📈" name="pmdarima"              note="Auto-ARIMA time-series model" />
                <StackBadge icon="🧠" name="TensorFlow / Keras"    note="LSTM neural network model" />
                <StackBadge icon="🤗" name="Hugging Face Hub"      note="Model file storage and distribution" />
                <StackBadge icon="☁️" name="Render (free tier)"    note="Backend hosting — sleeps after inactivity" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-forest-muted uppercase tracking-wide mb-2">Frontend</p>
              <div className="space-y-2">
                <StackBadge icon="⚛️" name="React + TypeScript"    note="Component-based SPA" />
                <StackBadge icon="⚡" name="Vite"                  note="Build tool and dev server" />
                <StackBadge icon="🎨" name="Tailwind CSS"          note="Utility-first styling" />
                <StackBadge icon="📊" name="Recharts"              note="SVG-based chart library" />
                <StackBadge icon="🔗" name="React Router v7"       note="Client-side routing" />
                <StackBadge icon="🌐" name="Netlify"               note="Frontend hosting with auto-deploy from GitHub" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-forest-muted uppercase tracking-wide mb-2">Data sources</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <StackBadge icon="📡" name="FEWS NET"    note="Monthly market prices (2015–2024)" />
              <StackBadge icon="🛰️" name="NASA POWER"  note="Satellite climate data" />
              <StackBadge icon="🇳🇬" name="NFPT"        note="Nigeria Food Price Tracker" />
            </div>
          </div>
        </Section>

        {/* ── Extending to other crops ─────────────── */}
        <Section icon={Code2} title="Extending to Other Crops">
          <p className="text-sm text-forest-muted leading-relaxed mb-4">
            The IMTISAL pipeline is designed to be reusable. To extend it to rice, sorghum, or millet:
          </p>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Collect price data',
                body: 'Download FEWS NET price data for the new commodity from fews.net/data. The CSV format is identical — replace the commodity column with the new crop.',
              },
              {
                step: '2',
                title: 'Re-run the cleaning pipeline',
                body: 'Edit cleaner.py to point at the new FEWS NET file. Run python cleaner.py then python merger.py to rebuild maize_master_clean.csv for the new crop.',
              },
              {
                step: '3',
                title: 'Retrain the models',
                body: 'Run python train_svm.py, python train_rf.py, python train_arima.py, python train_lstm.py. Models and metrics are saved to models/.',
              },
              {
                step: '4',
                title: 'Upload to Hugging Face',
                body: 'Run python upload_models_to_hf.py to push the new .pkl and .keras files to your HF repo. Render will download them at next startup.',
              },
              {
                step: '5',
                title: 'Update the API',
                body: 'No code changes needed — the API dynamically reads metrics and predictions from the loaded models. Just trigger a Render redeploy after the HF upload.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-dark">{title}</p>
                  <p className="text-sm text-forest-muted leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-forest-50 border border-forest-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-forest-dark mb-1">Multi-crop deployment</p>
            <p className="text-xs text-forest-muted leading-relaxed">
              For a production multi-crop system, add a <code className="font-mono">commodity</code> parameter to{' '}
              <code className="font-mono">/api/predict</code> and maintain separate model sets (e.g.{' '}
              <code className="font-mono">models/rice/</code>, <code className="font-mono">models/sorghum/</code>)
              loaded into the store at startup.
            </p>
          </div>
        </Section>

        {/* ── Future Work ──────────────────────────── */}
        <Section icon={Lightbulb} title="Future Work">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: '🌦️',
                title: 'NiMet Real Weather Data',
                body: 'Integration with the Nigerian Meteorological Agency (NiMet) API would replace NASA POWER satellite estimates with ground-truth station data, potentially improving LSTM accuracy by providing more precise local climate readings.',
              },
              {
                icon: '🌾',
                title: 'Multi-Crop Extension',
                body: 'Extend the system to rice, sorghum, and millet — the three other staple grains in Adamawa State. The existing pipeline and training scripts are designed to be reusable with minimal changes.',
              },
              {
                icon: '📱',
                title: 'SMS Alerts via Termii API',
                body: 'Integrate the Termii SMS gateway to deliver automated monthly price forecasts directly to farmers\' mobile phones. This removes the requirement for internet access and reaches users in rural areas.',
              },
              {
                icon: '🗣️',
                title: 'Hausa Language Support',
                body: 'Add a Hausa-language UI for all pages. The majority of end-users in Adamawa State are Hausa speakers. This is critical for adoption by smallholder farmers who may not read English.',
              },
              {
                icon: '🗄️',
                title: 'PostgreSQL / Supabase Backend',
                body: 'Replace CSV-based data storage with a PostgreSQL database for real-time data ingestion, faster queries, and the ability to append new price data monthly without redeploying.',
              },
              {
                icon: '🔄',
                title: 'Automated Monthly Retraining',
                body: 'Schedule a monthly pipeline that fetches new FEWS NET data, appends it to the training set, retrains all models, evaluates them, and promotes the best-performing model to production automatically.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-3 p-4 bg-forest-50 rounded-xl border border-forest-100">
                <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-forest-dark mb-1">{title}</p>
                  <p className="text-xs text-forest-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Quick links ──────────────────────────── */}
        <Section icon={Globe} title="Project Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Backend API',         url: 'https://imtisal-maize-api.onrender.com',   note: 'Render — FastAPI' },
              { label: 'API Docs (Swagger)',   url: 'https://imtisal-maize-api.onrender.com/docs', note: 'Interactive OpenAPI docs' },
              { label: 'Backend GitHub',       url: 'https://github.com/sadiqrimau/imtisal-maize', note: 'Python / FastAPI source' },
              { label: 'Frontend GitHub',      url: 'https://github.com/sadiqrimau/maize_prediction', note: 'React / TypeScript source' },
              { label: 'Model Files (HF Hub)', url: 'https://huggingface.co/Alim-7/imtisal-maize-models', note: 'Trained .pkl and .keras files' },
              { label: 'Data: FEWS NET',       url: 'https://fews.net/data',   note: 'Market price data source' },
              { label: 'Data: NASA POWER',     url: 'https://power.larc.nasa.gov', note: 'Climate data source' },
            ].map(({ label, url, note }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-forest-50 rounded-xl border border-forest-100 hover:bg-forest-100 hover:border-forest-200 transition-colors duration-150 group"
              >
                <div>
                  <p className="text-sm font-semibold text-forest-dark group-hover:text-forest">{label}</p>
                  <p className="text-xs text-forest-muted">{note}</p>
                </div>
                <ArrowRight size={14} className="text-forest-muted group-hover:text-forest transition-colors" />
              </a>
            ))}
          </div>
        </Section>

        <p className="text-xs text-forest-muted text-center pb-6">
          IMTISAL v1.0 · Al-Hikmah University 2026 · Adamawa State, Nigeria
        </p>
      </div>
    </div>
  );
}
