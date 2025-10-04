import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import React, { useEffect, useState } from "react";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#8b5cf6"];

const PollutantChart = () => {
  const [data, setData] = useState<Array<any>>([]);

  useEffect(() => {
    const applyLatest = (latest: any) => {
      const individual = latest?.individualAqis ?? null;
      if (individual) {
        const order = ["PM2.5", "PM10", "NO2", "SO2", "O3"];
        const chartData = order.map((k, i) => ({ name: k, value: Math.round(individual[k] ?? 0), color: COLORS[i % COLORS.length] }));
        setData(chartData);
      }
    };

    applyLatest((window as any).__LATEST_AQI_PAYLOAD ?? null);
    const handler = (e: any) => applyLatest(e.detail ?? null);
    window.addEventListener('latest-aqi-updated', handler as EventListener);
    return () => window.removeEventListener('latest-aqi-updated', handler as EventListener);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-lg border border-border"
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Pollutant Composition (by individual AQI)</h2>
      <p className="text-muted-foreground text-sm mb-6">Realtime pollutant contributions based on latest fetched AQI</p>
      {data.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-muted-foreground">No pollutant data yet. Fetch AQI above to populate the chart.</div>
      )}
    </motion.div>
  );
};

export default PollutantChart;
