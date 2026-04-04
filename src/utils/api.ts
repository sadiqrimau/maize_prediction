const API_BASE_URL = 'https://imtisal-maize-api.onrender.com';

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with automatic retry on network errors or non-OK responses.
 *  Waits RETRY_DELAY_MS between attempts. Does not retry 4xx client errors. */
async function fetchWithRetry(
  input: string,
  init?: RequestInit,
  retries = RETRY_COUNT,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(input, init);
      // Don't retry client errors (4xx) — they won't change on retry
      if (response.status >= 400 && response.status < 500) return response;
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await sleep(RETRY_DELAY_MS);
      }
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
  predicted_price: number;
  model_used: string;
}

/* ── API surface ───────────────────────────────────── */

export const api = {
  /** Wake up the Render server. Call once at app startup. */
  async ping(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/`);
    } catch {
      // Ignore — ping is best-effort
    }
  },

  async getHistoricalData(): Promise<HistoricalDataPoint[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/historical`);
    if (!response.ok) throw new Error('Failed to fetch historical data');
    return response.json();
  },

  async getModelStats(): Promise<ModelStats[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/model-stats`);
    if (!response.ok) throw new Error('Failed to fetch model statistics');
    return response.json();
  },

  async predictPrice(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to get prediction');
    return response.json();
  },
};
