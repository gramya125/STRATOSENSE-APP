# Server (FastAPI)

This server provides a `/predict` endpoint which loads a PyTorch `.pth` model (if present) and returns a 10-day AQI forecast. It also contains a small DB scaffold that can use SQLite (via SQLModel) or MongoDB (via motor).

Quick start (PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# set OPENWEATHER_API_KEY if you want the server to fetch base inputs from OpenWeather
$env:OPENWEATHER_API_KEY = "your_api_key_here"
uvicorn main:app --reload --port 8000
```

DB options:
- SQLite (default): runs with `sqlmodel` and stores `server.db` in project root.
- MongoDB: set `MONGO_URI` environment variable to point at a MongoDB Atlas or local instance.

Model file:
- Place your PyTorch model at `src/server/model.pth`. The server tries to load it on startup.

*** End Patch