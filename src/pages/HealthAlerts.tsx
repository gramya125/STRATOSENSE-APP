import { motion } from "framer-motion";
import { AlertTriangle, Heart, Activity, Thermometer, Wind, Info } from "lucide-react";

const alerts = [
  {
    title: "Respiratory Risk - High",
    description: "Current PM2.5 levels are hazardous for people with respiratory conditions",
    severity: "high",
    icon: Activity,
    recommendations: [
      "Stay indoors as much as possible",
      "Use N95 masks if going outside",
      "Keep inhalers and medications accessible",
    ],
  },
  {
    title: "Cardiovascular Risk - Moderate",
    description: "Elevated pollution may affect individuals with heart conditions",
    severity: "moderate",
    icon: Heart,
    recommendations: [
      "Avoid strenuous outdoor activities",
      "Monitor blood pressure regularly",
      "Consult doctor if symptoms worsen",
    ],
  },
  {
    title: "Heat Advisory",
    description: "High temperature combined with pollution increases health risks",
    severity: "moderate",
    icon: Thermometer,
    recommendations: [
      "Stay hydrated",
      "Avoid peak sun hours (11 AM - 4 PM)",
      "Use air conditioning when possible",
    ],
  },
];

const HealthAlerts = () => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "moderate":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Health Alerts & Recommendations
          </h1>
          <p className="text-muted-foreground">
            Personalized health advisories based on current air quality
          </p>
        </motion.div>

        {/* Current Conditions Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-warning/30 to-destructive/30 border border-warning rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Unhealthy Air Quality Detected
              </h2>
              <p className="text-foreground/90 mb-4">
                AQI is currently at 156 - this is unhealthy for sensitive groups. Consider limiting
                outdoor exposure and follow the recommendations below.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-card px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">AQI: 156</span>
                </div>
                <div className="bg-card px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">PM2.5: 65 μg/m³</span>
                </div>
                <div className="bg-card px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">PM10: 142 μg/m³</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert Cards */}
        <div className="space-y-6 mb-8">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-gradient-to-br from-${getSeverityColor(alert.severity)}/20 to-${getSeverityColor(
                alert.severity
              )}/5 border border-${getSeverityColor(alert.severity)}/30 rounded-2xl p-6 shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-card text-${getSeverityColor(alert.severity)}`}>
                  <alert.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{alert.title}</h3>
                  <p className="text-muted-foreground mb-4">{alert.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Recommendations:</h4>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Symptom Correlation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border"
        >
          <div className="flex items-start gap-3 mb-6">
            <Info className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Symptom-Pollution Correlation
              </h2>
              <p className="text-muted-foreground text-sm">
                Track how air quality affects your health over time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Common Symptoms Today</h3>
              <div className="space-y-2">
                {[
                  { symptom: "Throat irritation", percentage: 78 },
                  { symptom: "Coughing", percentage: 65 },
                  { symptom: "Eye irritation", percentage: 52 },
                  { symptom: "Shortness of breath", percentage: 41 },
                ].map((item) => (
                  <div key={item.symptom}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{item.symptom}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Protective Measures</h3>
              <div className="space-y-3">
                {[
                  { measure: "Air purifier usage", icon: Wind },
                  { measure: "N95 mask when outside", icon: AlertTriangle },
                  { measure: "Indoor ventilation control", icon: Activity },
                  { measure: "Regular health monitoring", icon: Heart },
                ].map((item) => (
                  <div key={item.measure} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item.measure}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthAlerts;
