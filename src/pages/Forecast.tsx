import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Wind } from "lucide-react";

const hourlyData = [
  { time: "Now", aqi: 156, pm25: 65, pm10: 142 },
  { time: "1h", aqi: 152, pm25: 63, pm10: 138 },
  { time: "2h", aqi: 145, pm25: 58, pm10: 130 },
  { time: "3h", aqi: 138, pm25: 54, pm10: 122 },
  { time: "4h", aqi: 132, pm25: 52, pm10: 115 },
  { time: "5h", aqi: 128, pm25: 49, pm10: 108 },
  { time: "6h", aqi: 122, pm25: 45, pm10: 98 },
  { time: "7h", aqi: 118, pm25: 42, pm10: 92 },
  { time: "8h", aqi: 112, pm25: 38, pm10: 85 },
];

const Forecast = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Air Quality Forecast
          </h1>
          <p className="text-muted-foreground">
            8-hour prediction for Faridabad
          </p>
        </motion.div>

        {/* Trend Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6 text-success" />
              <h3 className="text-lg font-semibold text-foreground">Improving Trend</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Air quality expected to improve by 28% over the next 8 hours
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Wind className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Wind Patterns</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Favorable wind direction helping disperse pollutants
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Peak Time</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Current hour shows highest pollution levels
            </p>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Hourly Predictions</h2>
          <p className="text-muted-foreground text-sm mb-6">
            ML-powered forecast for the next 8 hours
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="AQI"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pm25"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                name="PM2.5"
                dot={{ fill: "hsl(var(--warning))", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="pm10"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="PM10"
                dot={{ fill: "hsl(var(--destructive))", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Forecast Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { day: "Tomorrow", aqi: 125, level: "Moderate", color: "warning" },
            { day: "Day 2", aqi: 98, level: "Good", color: "success" },
            { day: "Day 3", aqi: 108, level: "Moderate", color: "warning" },
            { day: "Day 4", aqi: 142, level: "Unhealthy", color: "destructive" },
          ].map((forecast, index) => (
            <motion.div
              key={forecast.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`bg-gradient-to-br from-${forecast.color}/20 to-${forecast.color}/5 border border-${forecast.color}/30 rounded-xl p-5 shadow-lg`}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{forecast.day}</h3>
              <div className="text-3xl font-bold text-foreground mb-1">{forecast.aqi}</div>
              <p className="text-sm text-muted-foreground">{forecast.level}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Forecast;
