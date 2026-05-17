// Yola, Adamawa State — coordinates used for all weather fetches
const LAT = 9.2;
const LON = 12.5;

export interface WeatherData {
  cloud_amount: number;   // average cloud cover % for the month
  precipitation: number;  // total monthly precipitation (mm)
  temperature: number;    // average temperature °C
  month: number;          // 1–12
  label: string;          // human-readable source description
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export async function fetchCurrentMonthWeather(): Promise<WeatherData> {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  // Start = 1st of current month; End = yesterday (archive API lags 1 day)
  const start = new Date(year, month - 1, 1);
  const end   = new Date(now);
  end.setDate(end.getDate() - 1);

  // If we're on the 1st, end would be last month — fall back to today
  if (end < start) end.setDate(start.getDate());

  const startStr = toDateStr(start);
  const endStr   = toDateStr(end);

  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${LAT}&longitude=${LON}` +
    `&start_date=${startStr}&end_date=${endStr}` +
    `&daily=temperature_2m_mean,precipitation_sum,cloudcover_mean` +
    `&timezone=Africa%2FLagos`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
  const data = await res.json();

  const temps:   number[] = (data.daily.temperature_2m_mean  ?? []).filter((v: number | null) => v !== null);
  const precips: number[] = (data.daily.precipitation_sum    ?? []).filter((v: number | null) => v !== null);
  const clouds:  number[] = (data.daily.cloudcover_mean      ?? []).filter((v: number | null) => v !== null);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

  return {
    cloud_amount:  Math.round(avg(clouds)),
    precipitation: Math.round(sum(precips)),
    temperature:   Math.round(avg(temps) * 10) / 10,
    month,
    label: `Live · Yola, Adamawa · ${monthNames[month - 1]} ${year}`,
  };
}
