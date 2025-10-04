import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import React, { useEffect, useState } from "react";

// Restore the richer, more saturated palette used earlier for better contrast
const PIE_COLORS = [
  '#fee2e2', // light red
  '#fbbf24', // yellow
  '#fb923c', // orange
  '#ef4444', // true red
  '#c026d3', // magenta/purple
  '#3b82f6', // blue
  '#22c55e', // green
];

type ChartEntry = { name: string; value: number };

const PollutantChart: React.FC = () => {
  const [data, setData] = useState<ChartEntry[]>([]);

  useEffect(() => {
    const applyLatest = (latest: any) => {
      const individual = latest?.individualAqis ?? null;
      if (individual) {
        const order = ["PM2.5", "PM10", "NO2", "SO2", "O3"];
        const chartData = order.map((k, i) => ({ name: k, value: Math.max(0, Math.round(Number(individual[k] ?? 0))) }));
        setData(chartData);
      }
    };

    applyLatest((window as any).__LATEST_AQI_PAYLOAD ?? null);
    const handler = (e: any) => applyLatest(e.detail ?? null);
    window.addEventListener('latest-aqi-updated', handler as EventListener);
    return () => window.removeEventListener('latest-aqi-updated', handler as EventListener);
  }, []);

  function labelFormatter(entry: any) {
    const name = entry.name ?? '';
    const percent = Number(entry.percent ?? 0);
    return `${name} ${Math.round(percent * 100)}%`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.12 }}
      className="bg-aqi-card rounded-2xl p-6 shadow-lg border border-border card-premium"
      style={{ background: `linear-gradient(135deg, ${PIE_COLORS[0]}11, ${PIE_COLORS[1]}0d, ${PIE_COLORS[2]}08)` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pollutant Composition</h2>
          <p className="text-muted-foreground text-sm">Realtime contributions (IAQI) — tap a slice for details</p>
        </div>
        <div>
          <button
            onClick={() => {
              const evt = new CustomEvent('pollutant-chart-refresh');
              window.dispatchEvent(evt);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow"
            style={{ background: `linear-gradient(90deg, ${PIE_COLORS[0]}, ${PIE_COLORS[2]})` }}
          >
            View details
          </button>
        </div>
      </div>

      {data.length ? (
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={140}
              innerRadius={48}
              label={labelFormatter}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.06)" strokeWidth={0.8} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}`, 'IAQI']} contentStyle={{ background: 'rgba(0,0,0,0.6)', border: 'none' }} />
            <Legend verticalAlign="bottom" wrapperStyle={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-muted-foreground">No pollutant data yet. Fetch AQI above to populate the chart.</div>
      )}
    </motion.div>
  );
};

export default PollutantChart;
