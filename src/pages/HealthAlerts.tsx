import { motion } from "framer-motion";
import { AlertTriangle, Heart, Activity, Thermometer, Wind, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

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

const HealthAlerts = () => {
  const [payload, setPayload] = useState<any>((window as any).__LATEST_AQI_PAYLOAD ?? null);
  const [symptomsInput, setSymptomsInput] = useState<string>("");
  const [recordedSymptoms, setRecordedSymptoms] = useState<string[]>([]);
  const [effectsData, setEffectsData] = useState<{
    summary: string;
    pollutants: string[];
    reportedSymptoms: string[];
    extra?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setPayload(e.detail ?? null);
    window.addEventListener("latest-aqi-updated", handler as EventListener);
    return () => window.removeEventListener("latest-aqi-updated", handler as EventListener);
  }, []);

  const overall = payload?.overallAqi ?? null;
  const components = payload?.components ?? {};

  function computeEffectsFromPayload(payload: any, symptoms: string[]) {
    const aqi = payload?.overallAqi ?? null;
    const base = getSymptom(aqi);

    const comps = payload?.components ?? {};
    const individual = payload?.individualAqis ?? {};
    const pollutantLines: string[] = [];
    if (comps?.pm2_5 != null) pollutantLines.push(`PM2.5: ${Number(comps.pm2_5).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['PM2.5'] ?? 0)})`);
    if (comps?.pm10 != null) pollutantLines.push(`PM10: ${Number(comps.pm10).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['PM10'] ?? 0)})`);
    if (comps?.no2 != null) pollutantLines.push(`NO2: ${Number(comps.no2).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['NO2'] ?? 0)})`);
    if (comps?.so2 != null) pollutantLines.push(`SO2: ${Number(comps.so2).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['SO2'] ?? 0)})`);
    if (comps?.o3 != null) pollutantLines.push(`O3: ${Number(comps.o3).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['O3'] ?? 0)})`);
    if (comps?.co != null) pollutantLines.push(`CO: ${Number(comps.co).toFixed(2)} µg/m³ (IAQI ${Math.round(individual?.['CO'] ?? 0)})`);

    const s = (symptoms || []).map((x) => x.toLowerCase());
    const hasCough = s.some((t) => t.includes("cough") || t.includes("throat") || t.includes("sore"));
    const hasBreath = s.some((t) => t.includes("short") || t.includes("breath") || t.includes("wheeze") || t.includes("difficulty"));

    let extra = "";
    if (hasBreath) {
      extra = "People reporting breathing difficulty should seek medical advice and avoid outdoor activity.";
    } else if (hasCough) {
      extra = "People with cough or throat irritation should limit outdoor exposure and consider masks or air purifiers.";
    } else if (symptoms.length) {
      extra = "Monitor symptoms closely and limit outdoor exertion if they worsen.";
    }

    return {
      summary: base,
      pollutants: pollutantLines,
      reportedSymptoms: symptoms || [],
      extra: extra || undefined,
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Health Alerts & Recommendations</h1>
          <p className="text-muted-foreground">Personalized health advisories based on current air quality</p>
        </motion.div>

        {/* Current Conditions Banner */}
  <motion.div className={`bg-gradient-to-r from-warning/30 to-destructive/30 border border-warning rounded-2xl p-8 mb-8 shadow-lg`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Current Air Quality</h2>
              <p className="text-foreground/90 mb-4">Category: {classifyAQI(overall)}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-card px-6 py-3 rounded-lg">
                  <span className="text-sm font-medium">AQI: {overall != null ? Math.round(overall) : '—'}</span>
                </div>
                <div className="bg-card px-6 py-3 rounded-lg">
                  <span className="text-sm font-medium">PM2.5: {components?.pm2_5 != null ? Number(components.pm2_5).toFixed(2) : '—'} μg/m³</span>
                </div>
                <div className="bg-card px-6 py-3 rounded-lg">
                  <span className="text-sm font-medium">PM10: {components?.pm10 != null ? Number(components.pm10).toFixed(2) : '—'} μg/m³</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Symptom recording + visualization + Effects container laid out in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-2xl font-semibold mb-3">Record your symptoms</h3>
            <p className="text-sm text-muted-foreground mb-4">Type symptoms (comma separated) and click Record to add them to your personal log. We'll visualize counts below.</p>
            <div className="mb-4">
              <textarea value={symptomsInput} onChange={(e) => setSymptomsInput(e.target.value)} className="w-full p-4 rounded-md border border-border mb-3 min-h-[80px] text-black" placeholder="e.g. cough, sore throat, shortness of breath" />
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => {
                  const items = symptomsInput.split(',').map(s => s.trim()).filter(Boolean);
                  if (items.length) {
                    setRecordedSymptoms(prev => [...prev, ...items]);
                    setSymptomsInput('');
                  }
                }}>Record</button>
                <button className="px-4 py-2 bg-muted rounded" onClick={() => { setSymptomsInput(''); }}>Clear</button>
                <button className="px-4 py-2 bg-destructive text-white rounded" onClick={() => setRecordedSymptoms([])}>Reset Log</button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Symptoms visualization</h4>
              {recordedSymptoms.length ? (
                <div className="h-64 bg-muted/10 p-4 rounded">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={Object.entries(recordedSymptoms.reduce((acc: any, s: string) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No symptoms recorded yet.</p>
              )}
            </div>
          </motion.div>

          <motion.div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-2xl font-semibold mb-3">Effects</h3>
            <p className="text-sm text-muted-foreground mb-4">Click the button below to get health recommendations based on current AQI.</p>
            <div className="flex flex-col gap-3">
              <button
                className="btn-premium inline-flex items-center gap-2"
                onClick={() => {
                  const latest = (window as any).__LATEST_AQI_PAYLOAD ?? payload;
                  setEffectsData(computeEffectsFromPayload(latest, recordedSymptoms));
                  setCopied(false);
                }}
                aria-label="Generate health effects and advice"
              >
                <Info className="h-4 w-4" />
                Effects & Advice
              </button>
              <button className="px-4 py-2 bg-muted rounded text-sm" onClick={() => { setEffectsData(null); setCopied(false); }}>Clear</button>
            </div>

            {effectsData && (
              <div className="mt-6 card-premium p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">Recommended Actions</h4>
                    <p className="text-sm text-muted-foreground mt-1">Based on current AQI and your recorded symptoms</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-1 rounded text-sm bg-secondary/10 hover:bg-secondary/20`}
                      onClick={async () => {
                        try {
                          const lines = [
                            `AQI: ${payload?.overallAqi != null ? Math.round(payload.overallAqi) : '—'}`,
                            `Summary: ${effectsData.summary}`,
                            ...(effectsData.pollutants.length ? ['Pollutants:', ...effectsData.pollutants.map(p => ` - ${p}`)] : []),
                            ...(effectsData.reportedSymptoms.length ? [`Reported symptoms: ${effectsData.reportedSymptoms.join(', ')}`] : []),
                            ...(effectsData.extra ? [effectsData.extra] : []),
                          ].join('\n');
                          await navigator.clipboard.writeText(lines);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          // ignore clipboard errors
                        }
                      }}
                    >{copied ? 'Copied' : 'Copy'}</button>
                    <button className="px-3 py-1 rounded text-sm bg-muted/10 hover:bg-muted/20" onClick={() => { setEffectsData(null); setCopied(false); }}>Close</button>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium">{effectsData.summary}</p>
                </div>

                {effectsData.pollutants.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Pollutants</h5>
                    <ul className="text-sm list-disc list-inside space-y-0.5">
                      {effectsData.pollutants.map((p, i) => (
                        <li key={i} className="text-muted-foreground">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {effectsData.reportedSymptoms.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Your reported symptoms</h5>
                    <div className="flex flex-wrap gap-2">
                      {effectsData.reportedSymptoms.map((s, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {effectsData.extra && (
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Additional advice</h5>
                    <p className="text-sm text-muted-foreground">{effectsData.extra}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthAlerts;
