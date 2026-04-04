const API_BASE_URL = 'https://imtisal-maize-api.onrender.com';

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

export const api = {
  async getHistoricalData(): Promise<HistoricalDataPoint[]> {
    const response = await fetch(`${API_BASE_URL}/api/historical`);
    if (!response.ok) throw new Error('Failed to fetch historical data');
    return response.json();
  },

  async getModelStats(): Promise<ModelStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/model-stats`);
    if (!response.ok) throw new Error('Failed to fetch model stats');
    return response.json();
  },

  async predictPrice(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to predict price');
    return response.json();
  },
};
