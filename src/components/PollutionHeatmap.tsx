import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// Define pollution data points for Faridabad
const faridabadPollutionData = [
  { lat: 28.4089, lng: 77.3178, intensity: 0.9, name: "City Center" }, // High pollution
  { lat: 28.4209, lng: 77.3088, intensity: 0.7, name: "Sector 15" },
  { lat: 28.3959, lng: 77.3268, intensity: 0.85, name: "Old Faridabad" },
  { lat: 28.4339, lng: 77.2998, intensity: 0.6, name: "Sector 12" },
  { lat: 28.3809, lng: 77.3358, intensity: 0.75, name: "Ballabgarh" },
  { lat: 28.4189, lng: 77.2898, intensity: 0.5, name: "Sector 16" },
  { lat: 28.4089, lng: 77.3378, intensity: 0.8, name: "Sector 21" },
  { lat: 28.3909, lng: 77.3088, intensity: 0.65, name: "Sector 28" },
];

const PollutionHeatmap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Faridabad
    const map = L.map(mapContainerRef.current, {
      center: [28.4089, 77.3178],
      zoom: 13,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add pollution markers with circles
    faridabadPollutionData.forEach((point) => {
      const color = getColorByIntensity(point.intensity);
      const radius = point.intensity * 300 + 100;

      // Create circle marker
      const circle = L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        radius: radius,
        weight: 2,
      }).addTo(map);

      // Add popup with pollution info
      circle.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${point.name}</h3>
          <p class="text-xs">AQI Level: ${getAQILabel(point.intensity)}</p>
          <p class="text-xs">Intensity: ${(point.intensity * 100).toFixed(0)}%</p>
        </div>
      `);

      // Add pulsing animation effect
      const pulsingCircle = L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: radius * 1.5,
        weight: 1,
        className: "pulse-circle",
      }).addTo(map);
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getColorByIntensity = (intensity: number): string => {
    if (intensity >= 0.8) return "#ef4444"; // Red - Dangerous
    if (intensity >= 0.6) return "#f59e0b"; // Amber - Unhealthy
    if (intensity >= 0.4) return "#eab308"; // Yellow - Moderate
    return "#22c55e"; // Green - Good
  };

  const getAQILabel = (intensity: number): string => {
    if (intensity >= 0.8) return "Dangerous";
    if (intensity >= 0.6) return "Unhealthy";
    if (intensity >= 0.4) return "Moderate";
    return "Good";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border"
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Live Pollution Heatmap - Faridabad</h2>
        <p className="text-muted-foreground text-sm">
          Interactive map showing real-time air quality across different areas
        </p>
      </div>
      <div ref={mapContainerRef} className="h-[500px] w-full" />
      <div className="p-4 bg-muted/30 flex items-center justify-around text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-success"></div>
          <span>Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-warning"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
          <span>Unhealthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive"></div>
          <span>Dangerous</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PollutionHeatmap;
