import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Vehicles", value: 35, color: "#3b82f6" },
  { name: "Industry", value: 28, color: "#ef4444" },
  { name: "Construction", value: 18, color: "#f59e0b" },
  { name: "Agriculture", value: 12, color: "#22c55e" },
  { name: "Other", value: 7, color: "#8b5cf6" },
];

const PollutantChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-lg border border-border"
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Pollution Source Attribution</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Breakdown of major contributors to air pollution
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PollutantChart;
