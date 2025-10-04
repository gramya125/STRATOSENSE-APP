import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from "recharts";
import { TrendingUp, TrendingDown, Wind } from "lucide-react";

// Breakpoints for PM2.5 and PM10 to compute individual AQI (same as AQIFetcher)
const breakpoints_pm25 = [
  [0, 50, 0, 30],
  [51, 100, 31, 60],
  [101, 200, 61, 90],
  [201, 300, 91, 120],
  [301, 400, 121, 250],
  [401, 500, 251, 500],
];

const breakpoints_pm10 = [
  [0, 50, 0, 50],
  [51, 100, 51, 100],
  [101, 200, 101, 250],
  [201, 300, 251, 350],
  [301, 400, 351, 430],
  [401, 500, 431, 600],
];

function calculateIndividualAQI(conc: number, breakpoints: number[][]) {
  for (const [Il, Ih, BPl, BPh] of breakpoints) {
    if (conc >= BPl && conc <= BPh) {
      return ((Ih - Il) / (BPh - BPl)) * (conc - BPl) + Il;
    }
  }
  return null;
}

// Simulate a 10-day forecast from latest payload if no model output is provided.
function simulate10DayFromPayload(payload: any, days = 10) {
  const basePm25 = payload?.components?.pm2_5 ?? 50;
  const basePm10 = payload?.components?.pm10 ?? 80;
  const startDate = new Date();
  const rows: Array<any> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + i);
    // simple noise + small trend
    const noiseFactor = 1 + (Math.sin(i / 2) * 0.05) + (Math.random() - 0.5) * 0.08;
    const pm25 = Math.max(0, basePm25 * noiseFactor * (1 + i * 0.005));
    const pm10 = Math.max(0, basePm10 * (1 + (Math.random() - 0.5) * 0.1) * (1 + i * 0.004));
    const ia_pm25 = calculateIndividualAQI(pm25, breakpoints_pm25) ?? 0;
    const ia_pm10 = calculateIndividualAQI(pm10, breakpoints_pm10) ?? 0;
    const overall = Math.max(ia_pm25, ia_pm10);
    rows.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), aqi: Math.round(overall), pm25: Number(pm25.toFixed(2)) });
  }
  return rows;
}

const Forecast = () => {
  const [payload, setPayload] = useState<any>((window as any).__LATEST_AQI_PAYLOAD ?? null);
  const [predictions, setPredictions] = useState<Array<any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: any) => setPayload(e.detail ?? null);
    window.addEventListener('latest-aqi-updated', handler as EventListener);
    return () => window.removeEventListener('latest-aqi-updated', handler as EventListener);
  }, []);

  useEffect(() => {
    // Try calling the local prediction server first, fall back to simulation
    async function getPredictions() {
      setLoading(true);
      const serverUrl = 'http://localhost:8000/predict';
      try {
        const body: any = {};
        if (payload && payload.components) {
          // map frontend payload components to server expected base_input keys
          body.base_input = {
            'PM2.5': payload.components.pm2_5,
            'PM10': payload.components.pm10,
            'NO': payload.components.no ?? 0,
            'NO2': payload.components.no2 ?? 0,
            'NH3': payload.components.nh3 ?? 0,
            'CO': payload.components.co ?? 0,
            'SO2': payload.components.so2 ?? 0,
            'O3': payload.components.o3 ?? 0,
            'Year': new Date().getUTCFullYear(),
            'Month': new Date().getUTCMonth() + 1,
            'Day': new Date().getUTCDate(),
            'Hour': new Date().getUTCHours(),
          };
          body.days = 10;
        } else {
          // no payload — rely on server to fetch by lat/lon if available
          body.days = 10;
        }

        const resp = await fetch(serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`server responded ${resp.status}`);
        const data = await resp.json();
        if (data && data.predictions) {
          const mapped = data.predictions.map((p: any) => ({ date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), aqi: Math.round(p.predicted_aqi), pm25: Number(p.pm25) }));
          setPredictions(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        // server not reachable or failed — fall back
        // console.debug('Predict server failed, falling back to simulation', err);
      }

      // fallback to simulation
      setPredictions(simulate10DayFromPayload(payload, 10));
      setLoading(false);
    }

    getPredictions();
  }, [payload]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Forecasting AQI for the next 10 days</h1>
          <p className="text-muted-foreground">10-day AQI predictions </p>
        </motion.div>

        {/* Forecast is simulated from latest fetched AQI data (AQIFetcher) */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm text-muted-foreground">Forecast inputs are taken from the latest fetched AQI values (PM2.5/PM10/etc.).</label>
        </div>

        <motion.div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">10-Day AQI Predictions</h2>
          <p className="text-muted-foreground text-sm mb-4">Bar chart shows predicted AQI (numeric). PM2.5 is shown on the line axis.</p>
          <ResponsiveContainer width="100%" height={420}>
            {predictions ? (
              <BarChart data={predictions} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="aqi" name="Predicted AQI" fill="#ef4444" />
                <Line yAxisId="right" type="monotone" dataKey="pm25" name="PM2.5 (µg/m³)" stroke="#f59e0b" strokeWidth={3} />
              </BarChart>
            ) : (
              <div className="text-sm text-muted-foreground">No predictions available yet.</div>
            )}
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
};

export default Forecast;
