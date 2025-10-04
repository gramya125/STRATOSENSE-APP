import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// We'll generate heatmap points around Faridabad center and map intensity from latest overall AQI
const defaultCenter = { lat: 28.4089, lng: 77.3178 };

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

    const latest = (window as any).__LATEST_AQI_PAYLOAD ?? null;
    const baseAqi = latest?.overallAqi ?? 50;

    // Build points - prefer window.__STATIONS array if provided by user
    const stations: Array<{ lat: number; lng: number; name?: string }> = (window as any).__STATIONS ?? [];
    const points: Array<{ lat: number; lng: number; name: string; intensity: number }> = [];

    if (stations.length) {
      for (const s of stations) {
        const intensity = Math.min(1, Math.max(0, (baseAqi - 20) / 200));
        points.push({ lat: s.lat, lng: s.lng, intensity, name: s.name ?? "Station" });
      }
    } else {
      // fallback grid points around center
      const offsets = [0, 0.003, -0.003, 0.006, -0.006];
      let idx = 0;
      for (const ox of offsets) {
        for (const oy of offsets) {
          const intensity = Math.min(1, Math.max(0, (baseAqi - 20) / 200));
          points.push({ lat: defaultCenter.lat + ox, lng: defaultCenter.lng + oy, intensity, name: `Area ${++idx}` });
        }
      }
    }

    // Add pollution markers with circles based on computed intensities
    points.forEach((point) => {
      const color = getColorByIntensity(point.intensity);
      const radius = point.intensity * 400 + 100;

      const circle = L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        radius: radius,
        weight: 2,
      }).addTo(map);

      circle.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${point.name}</h3>
          <p class="text-xs">AQI (approx): ${Math.round(baseAqi)}</p>
          <p class="text-xs">Intensity: ${(point.intensity * 100).toFixed(0)}%</p>
        </div>
      `);

      circle.on('click', () => {
        // user clicked area — fire an event so AQIFetcher or other listener can act (e.g., fetch local AQI)
        window.dispatchEvent(new CustomEvent('heatmap-area-clicked', { detail: { lat: point.lat, lon: point.lng } }));
      });
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
