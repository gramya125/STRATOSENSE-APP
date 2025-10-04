import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AQICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  level?: "good" | "moderate" | "unhealthy" | "dangerous";
  delay?: number;
}

const AQICard = ({ title, value, unit, icon: Icon, level = "good", delay = 0 }: AQICardProps) => {
  const levelStyles = {
    good: "from-success/20 to-success/5 border-success/30",
    moderate: "from-warning/20 to-warning/5 border-warning/30",
    unhealthy: "from-destructive/20 to-destructive/5 border-destructive/30",
    dangerous: "from-destructive/30 to-destructive/10 border-destructive/40",
  };

  const iconStyles = {
    good: "text-success",
    moderate: "text-warning",
    unhealthy: "text-destructive",
    dangerous: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br ${levelStyles[level]} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-card ${iconStyles[level]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
};

export default AQICard;
