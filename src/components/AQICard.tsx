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
    good: "from-aqi-background/30 to-aqi-card/10 border border-border",
    moderate: "from-aqi-background/30 to-aqi-card/10 border border-border",
    unhealthy: "from-aqi-background/30 to-aqi-card/10 border border-border",
    dangerous: "from-aqi-background/30 to-aqi-card/10 border border-border",
  };

  const iconStyles = {
    good: "text-aqi-red",
    moderate: "text-aqi-orange",
    unhealthy: "text-aqi-yellow",
    dangerous: "text-aqi-red",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br ${levelStyles[level]} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all card-premium`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-800 to-transparent ${iconStyles[level]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-extrabold text-foreground">{value}</span>
        {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
};

export default AQICard;
