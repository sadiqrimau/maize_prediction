const API_BASE_URL = 'https://imtisal-maize-api.onrender.com';

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000;   // 5 s between data-fetch retries
const REQUEST_TIMEOUT_MS = 45000; // 45 s per individual attempt

/* ── Internal helpers ──────────────────────────────── */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(
  input: string,
  init?: RequestInit,
  retries = RETRY_COUNT,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(input, init);
      if (response.status >= 400 && response.status < 500) return response;
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

/* ── Public types ──────────────────────────────────── */

export interface HistoricalDataPoint {
  Date: string;
  Price: number;
}

export interface ModelStats {
  model: string;
  mae: number;
  rmse: number;
  mape: number;
}

export interface PredictionRequest {
  month: number;
  cloud_amount: number;
  precipitation: number;
  temperature: number;
  model: string;
}

export interface PredictionResponse {
  predicted_price: number;   // NGN per kg, normalised from API
  model_used: string;
}

/* ── Normalisation helpers ─────────────────────────── */

/**
 * /api/historical returns:
 *   { total, offset, limit, count, data: [{ date, fews_maize_price_ngn_kg, ... }] }
 *
 * We normalise to HistoricalDataPoint[] { Date, Price }
 */
function normaliseHistorical(raw: unknown): HistoricalDataPoint[] {
  console.log('[api] /api/historical raw response:', raw);

  // Unwrap envelope if present
  const items: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.data)
    ? (raw as any).data
    : [];

  if (items.length === 0) {
    console.warn('[api] /api/historical: no items found in response', raw);
  }

  return items.map((d: any) => ({
    // API uses lowercase "date"; fall back to "Date" for safety
    Date: d.date ?? d.Date ?? '',
    // Price field is "fews_maize_price_ngn_kg"; fall back to "Price"
    Price: parseFloat(d.fews_maize_price_ngn_kg ?? d.Price ?? 0),
  })).filter((d) => d.Date !== '' && !isNaN(d.Price));
}

/**
 * /api/model-stats returns a keyed object:
 *   { svm: { mae_ngn_kg, rmse_ngn_kg, mape_pct }, rf: {...}, ... }
 *
 * We normalise to ModelStats[] [{ model, mae, rmse, mape }]
 */
const MODEL_STAT_KEYS = ['svm', 'rf', 'arima', 'lstm'] as const;

function normaliseModelStats(raw: unknown): ModelStats[] {
  console.log('[api] /api/model-stats raw response:', raw);

  // If the API ever returns a plain array, pass it through
  if (Array.isArray(raw)) {
    return (raw as any[]).map((s) => ({
      model: String(s.model ?? ''),
      mae:  Number(s.mae_ngn_kg ?? s.mae  ?? 0),
      rmse: Number(s.rmse_ngn_kg ?? s.rmse ?? 0),
      mape: Number(s.mape_pct ?? s.mape   ?? 0),
    }));
  }

  const obj = raw as Record<string, any>;
  const result: ModelStats[] = [];

  for (const key of MODEL_STAT_KEYS) {
    if (!obj[key]) continue;
    result.push({
      model: key,
      mae:  Number(obj[key].mae_ngn_kg  ?? obj[key].mae  ?? 0),
      rmse: Number(obj[key].rmse_ngn_kg ?? obj[key].rmse ?? 0),
      mape: Number(obj[key].mape_pct    ?? obj[key].mape ?? 0),
    });
  }

  if (result.length === 0) {
    console.warn('[api] /api/model-stats: could not parse any models from', raw);
  }

  return result;
}

/**
 * /api/predict returns:
 *   { model_used, predicted_price_ngn_kg, predicted_price_ngn_bag100kg, ... }
 *
 * We expose predicted_price = predicted_price_ngn_kg
 */
function normalisePrediction(raw: unknown): PredictionResponse {
  console.log('[api] /api/predict raw response:', raw);
  const r = raw as any;
  return {
    // Prefer the explicit NGN/kg field; fall back to legacy "predicted_price"
    predicted_price: Number(r.predicted_price_ngn_kg ?? r.predicted_price ?? 0),
    model_used: String(r.model_used ?? r.model ?? 'unknown'),
  };
}

/* ── API surface ───────────────────────────────────── */

export const api = {
  /**
   * Polls GET / every intervalMs until any HTTP response is received.
   * Never rejects. Calls onAttempt(n) before each try.
   */
  async pingUntilAlive(
    onAttempt?: (attempt: number) => void,
    intervalMs = 3000,
  ): Promise<void> {
    let attempt = 0;
    while (true) {
      onAttempt?.(attempt);
      try {
        await fetchWithTimeout(`${API_BASE_URL}/`, undefined, 10000);
        return;
      } catch {
        // swallow, wait, retry
      }
      attempt++;
      await sleep(intervalMs);
    }
  },

  async getHistoricalData(): Promise<HistoricalDataPoint[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/historical`);
    if (!response.ok) throw new Error(`Failed to fetch historical data (${response.status})`);
    const raw = await response.json();
    return normaliseHistorical(raw);
  },

  async getModelStats(): Promise<ModelStats[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/model-stats`);
    if (!response.ok) throw new Error(`Failed to fetch model statistics (${response.status})`);
    const raw = await response.json();
    return normaliseModelStats(raw);
  },

  async predictPrice(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to get prediction (${response.status})`);
    const raw = await response.json();
    return normalisePrediction(raw);
  },
};
