from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import numpy as np
import pandas as pd
import requests
from datetime import datetime, timedelta
import torch

ROOT = os.path.dirname(os.path.dirname(__file__))
# User uploaded model is at project/src/server/model.pth — compute absolute path
MODEL_PATH = os.path.abspath(os.path.join(ROOT, 'src', 'server', 'model.pth'))

app = FastAPI(title="AQI Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    days: Optional[int] = 10
    base_input: Optional[Dict[str, Any]] = None


class DayPrediction(BaseModel):
    date: str
    predicted_aqi: float
    pm25: float
    pm10: float
    details: Optional[Dict[str, Any]] = None


class PredictResponse(BaseModel):
    predictions: List[DayPrediction]


# Breakpoints and AQI helper (same logic as frontend)
breakpoints_pm25 = [
    (0, 50, 0, 30),
    (51, 100, 31, 60),
    (101, 200, 61, 90),
    (201, 300, 91, 120),
    (301, 400, 121, 250),
    (401, 500, 251, 500),
]

breakpoints_pm10 = [
    (0, 50, 0, 50),
    (51, 100, 51, 100),
    (101, 200, 101, 250),
    (201, 300, 251, 350),
    (301, 400, 351, 430),
    (401, 500, 431, 600),
]

def calculate_individual_aqi(conc, breakpoints):
    for Il, Ih, BPl, BPh in breakpoints:
        if BPl <= conc <= BPh:
            return ((Ih - Il) / (BPh - BPl)) * (conc - BPl) + Il
    return None


def calculate_overall_aqi_from_row(row: Dict[str, Any]):
    vals = []
    try:
        if row.get('PM2.5') is not None:
            v = calculate_individual_aqi(row['PM2.5'], breakpoints_pm25)
            if v is not None: vals.append(v)
        if row.get('PM10') is not None:
            v = calculate_individual_aqi(row['PM10'], breakpoints_pm10)
            if v is not None: vals.append(v)
    except Exception:
        pass
    return float(max(vals)) if vals else float('nan')


# Load model
MODEL = None
USE_TORCH = True
if not os.path.exists(MODEL_PATH):
    print("Warning: model file not found at", MODEL_PATH)
else:
    try:
        MODEL = torch.load(MODEL_PATH, map_location='cpu')
        MODEL.eval()
        print("Loaded PyTorch model from", MODEL_PATH)
    except Exception as e:
        print("Failed to load model with torch.load():", e)
        MODEL = None


def fetch_base_input_from_openweather(lat: float, lon: float, api_key: str):
    pollution_url = "https://api.openweathermap.org/data/2.5/air_pollution"
    weather_url = "https://api.openweathermap.org/data/2.5/weather"
    pollution_params = {"lat": lat, "lon": lon, "appid": api_key}
    pollution_resp = requests.get(pollution_url, params=pollution_params)
    pollution_resp.raise_for_status()
    pollution_data = pollution_resp.json()
    components = pollution_data['list'][0]['components']
    now = datetime.utcnow()
    base_input = {
        "PM2.5": components.get("pm2_5", 0.0),
        "PM10": components.get("pm10", 0.0),
        "NO": components.get("no", 0.0),
        "NO2": components.get("no2", 0.0),
        "NOx": 0.0,
        "NH3": components.get("nh3", 0.0),
        "CO": components.get("co", 0.0),
        "SO2": components.get("so2", 0.0),
        "O3": components.get("o3", 0.0),
        "Benzene": 0.0,
        "Toluene": 0.0,
        "Year": now.year,
        "Month": now.month,
        "Day": now.day,
        "Hour": now.hour,
    }
    return base_input


def build_forecast_rows(base_input: Dict[str, Any], days: int = 10):
    np.random.seed(42)
    sigma_map = {"PM2.5": 0.12, "PM10": 0.12, "NO": 0.15, "NO2": 0.15, "NOx": 0.15, "NH3": 0.12, "CO": 0.10, "SO2": 0.12, "O3": 0.12, "Benzene": 0.20, "Toluene": 0.20}
    default_sigma = 0.12
    start_date = datetime(base_input["Year"], base_input["Month"], base_input["Day"])
    rows = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        row = base_input.copy()
        row["Year"] = d.year
        row["Month"] = d.month
        row["Day"] = d.day
        row["Hour"] = base_input.get("Hour", 12)
        weekday = d.weekday()
        weekday_factor = 1.03 if weekday < 5 else 0.97
        for feat in ["PM2.5","PM10","NO","NO2","NOx","NH3","CO","SO2","O3","Benzene","Toluene"]:
            base_val = float(base_input.get(feat, 0.0))
            sigma = sigma_map.get(feat, default_sigma)
            noisy = base_val * (1 + np.random.normal(loc=0.0, scale=sigma))
            drift = 1.0 + (0.002 * i)
            val = max(0.0, noisy * weekday_factor * drift)
            row[feat] = float(val)
        rows.append(row)
    return pd.DataFrame(rows)


@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        # If base_input provided directly, use it (useful for testing)
        if req.base_input is not None:
            base_input = req.base_input
        elif req.lat is not None and req.lon is not None:
            # try to get OPENWEATHER_API_KEY from env first
            api_key = os.environ.get('OPENWEATHER_API_KEY', '')
            if not api_key:
                # fallback to none; OpenWeather call will likely fail if not set
                api_key = ''
            base_input = fetch_base_input_from_openweather(req.lat, req.lon, api_key)
        else:
            raise HTTPException(status_code=400, detail='Provide lat/lon or base_input')

        days = int(req.days or 10)
        df = build_forecast_rows(base_input, days=days)

        # Prepare model input — take numeric columns in a stable order
        feature_cols = [c for c in df.columns if c not in ('Year','Month','Day','Hour')]
        X = df[feature_cols].values.astype(np.float32)

        preds = None
        if MODEL is not None:
            try:
                with torch.no_grad():
                    tensor_in = torch.from_numpy(X)
                    out = MODEL(tensor_in)
                    # handle common output types
                    if isinstance(out, torch.Tensor):
                        preds = out.detach().cpu().numpy().flatten().tolist()
                    elif isinstance(out, (list, np.ndarray)):
                        preds = np.array(out).flatten().tolist()
                    else:
                        preds = [float(x) for x in out]
            except Exception as e:
                print('Model inference failed:', e)
                preds = None

        response_list = []
        for i in range(len(df)):
            date_str = (datetime(base_input['Year'], base_input['Month'], base_input['Day']) + timedelta(days=i)).strftime('%Y-%m-%d')
            pm25 = float(df.loc[i, 'PM2.5'])
            pm10 = float(df.loc[i, 'PM10'])
            if preds is not None and i < len(preds):
                predicted_aqi = float(preds[i])
            else:
                predicted_aqi = calculate_overall_aqi_from_row({'PM2.5': pm25, 'PM10': pm10})
            response_list.append({'date': date_str, 'predicted_aqi': predicted_aqi, 'pm25': pm25, 'pm10': pm10, 'details': {}})

        return {'predictions': response_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
