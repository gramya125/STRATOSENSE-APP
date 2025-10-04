import React, { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Activity, Droplets, Thermometer, AlertTriangle } from "lucide-react";
import AQICard from "@/components/AQICard";

// NOTE for beginners: Your OpenWeather API key is inlined here for the demo.
// Storing API keys in frontend code is not secure for production. For production move this to a backend.
const OPENWEATHER_API_KEY = "278b96b8f713c7c14e408c5618fd6b32";

type Components = {
  co?: number;
  no?: number;
  no2?: number;
  o3?: number;
  pm10?: number;
  pm2_5?: number;
  so2?: number;
};

// Breakpoint tables (Il, Ih, BPl, BPh)
const breakpoints_pm25 = [
  [0, 50, 0, 30],
  [51, 100, 31, 60],
  [101, 200, 61, 90],
  [201, 300, 91, 120],
  [301, 400, 121, 250],
  [401, 500, 251, 500],
];

const breakpoints_pm10 = [
  [0, 50, 0, 50],
  [51, 100, 51, 100],
  [101, 200, 101, 250],
  [201, 300, 251, 350],
  [301, 400, 351, 430],
  [401, 500, 431, 600],
];

const breakpoints_no2 = [
  [0, 50, 0, 40],
  [51, 100, 41, 80],
  [101, 200, 81, 180],
  [201, 300, 181, 280],
  [301, 400, 281, 400],
  [401, 500, 401, 540],
];

const breakpoints_so2 = [
  [0, 50, 0, 40],
  [51, 100, 41, 80],
  [101, 200, 81, 380],
  [201, 300, 381, 800],
  [301, 400, 801, 1600],
  [401, 500, 1601, 2100],
];

const breakpoints_co = [
  [0, 50, 0, 1],
  [51, 100, 1.1, 2],
  [101, 200, 2.1, 10],
  [201, 300, 10.1, 17],
  [301, 400, 17.1, 34],
  [401, 500, 34.1, 50],
];

const breakpoints_o3 = [
  [0, 50, 0, 50],
  [51, 100, 51, 100],
  [101, 200, 101, 168],
  [201, 300, 169, 208],
  [301, 400, 209, 748],
  [401, 500, 749, 1000],
];
function calculateIndividualAQI(conc: number, breakpoints: number[][]) {
  for (const [Il, Ih, BPl, BPh] of breakpoints) {
    if (conc >= BPl && conc <= BPh) {
      return ((Ih - Il) / (BPh - BPl)) * (conc - BPl) + Il;
    }
  }
  return null;
}

function classifyAQI(aqi: number | null) {
  if (aqi === null) return "Unknown";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function getSymptom(aqi: number | null) {
  if (aqi === null) return "No data";
  if (aqi <= 50) return "No symptoms — Air quality is good";
  if (aqi <= 100) return "Mild irritation — Sensitive individuals may feel slight discomfort";
  if (aqi <= 150) return "Coughing, throat irritation — People with asthma may experience breathing difficulty";
  if (aqi <= 200) return "Respiratory issues — People may start experiencing fatigue or chest discomfort";
  if (aqi <= 300) return "Severe breathing problems — Avoid outdoor activities";
  return "Health emergency — Everyone may experience serious effects";
}

export default function AQIFetcher() {
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<Components | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [individualAqis, setIndividualAqis] = useState<Record<string, number> | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  // publish to shared window-scoped store for simplicity (small app)
  const publishLatest = (payload: any) => {
    try {
      (window as any).__LATEST_AQI_PAYLOAD = payload;
      // dispatch an event so other components can listen if needed
      window.dispatchEvent(new CustomEvent("latest-aqi-updated", { detail: payload }));
    } catch (e) {
      // ignore
    }
  };
  const [pollutionDt, setPollutionDt] = useState<number | null>(null);
  const [weatherDt, setWeatherDt] = useState<number | null>(null);

  async function fetchAQIData(latitude: number, longitude: number) {
    // basic runtime validation for API key (avoid compile-time literal comparison)
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.trim().length < 10) {
      alert("Please set a valid OPENWEATHER_API_KEY in src/components/AQIFetcher.tsx before using this demo.");
      return;
    }

    setLoading(true);
    try {
      const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
      console.log("Fetching pollution URL:", pollutionUrl);
      const pollutionResp = await fetch(pollutionUrl);
      if (!pollutionResp.ok) throw new Error("Failed to fetch pollution data");
      const pollutionData = await pollutionResp.json();

  const componentsData: Components = pollutionData?.list?.[0]?.components ?? {};
  console.log("Parsed pollution components:", componentsData);
  const polDt = pollutionData?.list?.[0]?.dt ?? null;

  // expose timestamps and raw pollution response for debugging (compare with Kaggle)
  setPollutionDt(polDt);
  console.log("OpenWeather pollution response:", pollutionData);

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      console.log("Fetching weather URL:", weatherUrl);
      const weatherResp = await fetch(weatherUrl);
      if (!weatherResp.ok) throw new Error("Failed to fetch weather data");
  const weatherData = await weatherResp.json();

  // expose weather timestamp and raw weather response for debugging
  setWeatherDt(weatherData?.dt ?? null);
  console.log("OpenWeather weather response:", weatherData);

  setComponents(componentsData);
  setTemperature(weatherData?.main?.temp ?? null);
  setHumidity(weatherData?.main?.humidity ?? null);

  // compute AQI from components (produce a pollutant -> individual AQI map like your Python)
  const pm25 = componentsData.pm2_5 ?? componentsData["pm2_5" as keyof Components];
  const pm10 = componentsData.pm10;
  const no2 = componentsData.no2;
  const so2 = componentsData.so2;
  const co = componentsData.co;
  const o3 = componentsData.o3;

  const iAQIs: Record<string, number> = {};
  const ia_pm25 = pm25 != null ? calculateIndividualAQI(pm25, breakpoints_pm25) : null;
  if (ia_pm25 != null) iAQIs["PM2.5"] = ia_pm25;
  const ia_pm10 = pm10 != null ? calculateIndividualAQI(pm10, breakpoints_pm10) : null;
  if (ia_pm10 != null) iAQIs["PM10"] = ia_pm10;
  const ia_no2 = no2 != null ? calculateIndividualAQI(no2, breakpoints_no2) : null;
  if (ia_no2 != null) iAQIs["NO2"] = ia_no2;
  const ia_so2 = so2 != null ? calculateIndividualAQI(so2, breakpoints_so2) : null;
  if (ia_so2 != null) iAQIs["SO2"] = ia_so2;
  const ia_co = co != null ? calculateIndividualAQI(co, breakpoints_co) : null;
  if (ia_co != null) iAQIs["CO"] = ia_co;
  const ia_o3 = o3 != null ? calculateIndividualAQI(o3, breakpoints_o3) : null;
  if (ia_o3 != null) iAQIs["O3"] = ia_o3;

  const overall = Object.values(iAQIs).length ? Math.max(...Object.values(iAQIs)) : null;
  setIndividualAqis(Object.keys(iAQIs).length ? iAQIs : null);
  setAqi(overall);
      // publish essential data for other pages/components
      publishLatest({ components: componentsData, temperature: weatherData?.main?.temp ?? null, humidity: weatherData?.main?.humidity ?? null, individualAqis: iAQIs, overallAqi: overall, pollutionDt: polDt, weatherDt: weatherData?.dt ?? null });
    } catch (err) {
      console.error(err);
      alert("Error fetching data. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  // listen for heatmap clicks to fetch local AQI
  React.useEffect(() => {
    const handler = (e: any) => {
      const { lat, lon } = e.detail ?? {};
      if (lat != null && lon != null) {
        setLat(String(lat));
        setLon(String(lon));
        fetchAQIData(Number(lat), Number(lon));
      }
    };
    window.addEventListener('heatmap-area-clicked', handler as EventListener);
    return () => window.removeEventListener('heatmap-area-clicked', handler as EventListener);
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude));
        setLon(String(position.coords.longitude));
        // auto-fetch after permission
        fetchAQIData(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error(err);
        alert("Unable to get location: " + err.message);
      }
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Get AQI by Coordinates</h2>
        <p className="text-sm text-muted-foreground mb-4">Enter latitude and longitude manually or use <strong>Access Location</strong> to auto-detect.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Latitude</label>
            <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 28.7041" />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Longitude</label>
            <Input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="e.g. 77.1025" />
          </div>
          <div className="sm:col-span-1 flex gap-2">
            <Button onClick={() => {
              const latNum = Number(lat);
              const lonNum = Number(lon);
              if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
                alert('Please enter valid numeric latitude and longitude');
                return;
              }
              fetchAQIData(latNum, lonNum);
            }}>
              Fetch AQI
            </Button>
            <Button variant="outline" onClick={useCurrentLocation}>Access Location</Button>
            
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <div className="text-sm text-muted-foreground mb-3">Loading data...</div>}

      {/* AQI cards removed from here — Dashboard handles rendering the main realtime cards */}

      
    </div>
  );
}
