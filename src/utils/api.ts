const API_BASE_URL = 'https://imtisal-maize-api.onrender.com';

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000;   // 5 s between each data-fetch retry
const REQUEST_TIMEOUT_MS = 45000; // 45 s per individual attempt

/* ── Internal helpers ──────────────────────────────── */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wraps fetch with an AbortController timeout. */
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

/** Retries up to `retries` times with `RETRY_DELAY_MS` between attempts.
 *  Never retries 4xx client errors — they won't change on retry. */
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
  predicted_price: number;
  model_used: string;
}

/* ── API surface ───────────────────────────────────── */

export const api = {
  /**
   * Polls GET / every `intervalMs` until the server replies with any HTTP
   * response (even 404 is fine — it proves the server is awake).
   * Calls `onAttempt(n)` before each attempt so callers can update UI.
   * Resolves once alive; never rejects.
   */
  async pingUntilAlive(
    onAttempt?: (attempt: number) => void,
    intervalMs = 3000,
  ): Promise<void> {
    let attempt = 0;
    while (true) {
      onAttempt?.(attempt);
      try {
        // Short timeout for pings — we'd rather retry fast than wait 45s
        await fetchWithTimeout(`${API_BASE_URL}/`, undefined, 10000);
        return; // server responded — we're done
      } catch {
        // Swallow error, wait, try again
      }
      attempt++;
      await sleep(intervalMs);
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
