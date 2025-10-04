import { Droplets, Wind, Thermometer, Activity, AlertTriangle, Leaf } from "lucide-react";
import AQICard from "@/components/AQICard";
import AQIFetcher from "@/components/AQIFetcher";
import PollutionHeatmap from "@/components/PollutionHeatmap";
import PollutantChart from "@/components/PollutantChart";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Air Quality Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring for Faridabad, India
          </p>
        </motion.div>

  {/* AQI fetcher: manual coordinates + access location - inserted under hero */}
  <AQIFetcher />

  {/* consume latest published AQI payload (from AQIFetcher) */}
  <RealtimeValues />

        {/* (RealtimeValues above now renders the live AQI cards) */}

  {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <PollutantChart />
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <PollutionHeatmap />
      </div>
    </div>
  );
};

const RealtimeValues = () => {
  const [payload, setPayload] = useState<any>((window as any).__LATEST_AQI_PAYLOAD ?? null);

  useEffect(() => {
    const handler = (e: any) => setPayload(e.detail ?? null);
    window.addEventListener("latest-aqi-updated", handler as EventListener);
    return () => window.removeEventListener("latest-aqi-updated", handler as EventListener);
  }, []);

  const components = payload?.components ?? {};
  const individual = payload?.individualAqis ?? {};
  const overall = payload?.overallAqi ?? null;

  return (
    <>
      {overall != null && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AQICard title="Air Quality Index" value={Math.round(overall)} icon={Activity} level={overall <= 100 ? "good" : overall <= 200 ? "moderate" : "unhealthy"} delay={0} />
          <AQICard title="PM2.5 (μg/m³)" value={components?.pm2_5 ?? "—"} icon={Droplets} level={(components?.pm2_5 ?? 0) <= 30 ? "good" : "moderate"} delay={0.1} />
          <AQICard title="PM10 (μg/m³)" value={components?.pm10 ?? "—"} icon={AlertTriangle} level={(components?.pm10 ?? 0) <= 50 ? "good" : "moderate"} delay={0.2} />
          <AQICard title="Temperature (°C)" value={payload?.temperature ?? "—"} icon={Thermometer} level="good" delay={0.3} />
        </div>
      )}

      {/* Replace pie chart with pollutant percentages list when data available */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-2">Pollutant Percentages (by individual AQI)</h2>
        {individual && Object.keys(individual).length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(individual).map(([k, v]) => (
              <div key={k} className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">{k}</div>
                <div className="text-2xl font-bold text-foreground">{Math.round(Number(v))}</div>
                <div className="text-xs text-muted-foreground">AQI contribution</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pollutant data yet. Fetch AQI above.</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
