# AirAware — Winter Smog Navigation & Clean Air Action Platform

> **PromptWars Virtual | Main Challenge 06**  
> *A deployment-ready, full-stack platform empowering families, daily commuters, and urban communities to navigate hazardous winter smog with evidence-based interventions and low-emission routines.*

---

## 1. Product Overview

During winter months across smog-prone metropolitan basins, nocturnal thermal radiation inversions trap vehicle exhaust, biomass smoke, and industrial particulate matter in the lowest 50–100 meters of the atmosphere. Ambient PM2.5 concentrations routinely spike to hazardous levels (US AQI > 200–400+), presenting severe acute cardiovascular and respiratory health risks.

**AirAware** goes far beyond a passive AQI scoreboard. It is a proactive clean-air navigation companion that:
1. **Tracks Location-Specific Environmental Data:** Displays real-time **US AQI**, target pollutants (PM2.5, PM10, NO₂, SO₂, CO, O₃), and localized weather conditions with dynamic sensor units powered by Open-Meteo.
2. **Warns Against Morning Inversion Traps:** Explains why early morning hours (6:00 AM – 9:30 AM) are the most toxic of the day and suggests rescheduling outdoor exertion.
3. **Guides Low-Emission Daily Routines:** Delivers lifestyle-tailored schedules (Daily Commuter, Family with Kids, Remote Worker, Senior Citizens, General Resident) that minimize both personal exposure and community emissions.
4. **Provides Evidence-Based Indoor Hacks:** Surfaces cost-effective interventions (DIY Corsi-Rosenthal HEPA box filters, damp microfiber mopping, draft-proofing seals, two-stage kitchen ventilation, plant realities).
5. **Promotes Sustainable Alternatives:** Quantifies the direct emissions savings of replacing high-emission practices (open leaf burning, wood space heating, solo car commutes) with clean alternatives.
6. **Quantifies Individual Impact:** Interactive calculator measuring weekly CO₂ savings, PM2.5 soot prevented, and personal lung exposure reduction percentage.
7. **Rule-Based Clean Air Knowledge Assistant:** Provides verified, peer-reviewed environmental and health answers with complete transparency (*clearly labeled: AI Assistant coming in the next development phase*).

---

## 2. Tech Stack & Pinned Versions

### Frontend (`frontend/`)
- **Runtime / Framework:** React 18.3.1, Vite 5.4.11
- **Language:** JavaScript (ES Modules, strictly no TypeScript)
- **Styling:** Tailwind CSS 3.4.17 + PostCSS 8.4.49 + Autoprefixer 10.4.20 (Tailwind v3, not v4)
- **Icons:** `lucide-react` 0.344.0
- **Data Visualization:** `recharts` 2.12.7 (4-day hourly trajectory area charts with EPA breakpoints)
- **Zero other UI component libraries** to keep bundles lean, reliable, and performant.

### Backend (`backend/`)
- **Runtime:** Python 3.11+
- **Web Framework:** FastAPI 0.115.6, Uvicorn 0.34.0
- **Validation & Settings:** Pydantic v2 (2.10.4), Pydantic Settings (2.7.0)
- **HTTP Client:** `httpx` (0.28.1, fully async)
- **Testing:** `pytest` (8.3.4), `pytest-asyncio` (0.25.0), `respx` (0.22.0 for mock verification)
- **Persistence:** None required for MVP. Documented architecture ready for future PostgreSQL / SQLite persistence.

---

## 3. Data Providers & Standards

- **Air Quality API:** `https://air-quality-api.open-meteo.com/v1/air-quality`
  - Parameters: `latitude`, `longitude`, `current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`, `hourly=us_aqi,pm2_5`, `past_days=2&forecast_days=2`, `timezone=auto`.
  - Units are dynamically parsed from `current_units` and `hourly_units`; never hardcoded.
  - Nulls are treated as `"unavailable"` and never rendered as `0`.
- **Weather API:** `https://api.open-meteo.com/v1/forecast`
  - Parameters: `latitude`, `longitude`, `current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code,is_day`, `timezone=auto`.
  - WMO Weather Codes are mapped deterministically via `app/utils/weather.py`.
- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`
  - Gracefully handles missing `results` keys when queries yield zero matches.
- **Attribution & Terms:**
  - Air quality and meteorological data are provided by [Open-Meteo](https://open-meteo.com/) under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.
  - *Open-Meteo's free API tier is strictly for non-commercial use. Commercial deployments require an Open-Meteo commercial plan with proper attribution.*

---

## 4. US AQI Rules & Single Source of Truth

- **Standard:** **US AQI (United States Environmental Protection Agency Breakpoints)** is the single primary displayed standard throughout the UI and backend logic.
- **Centralized Engine:** Thresholds are centralized in **one single module**: `backend/app/utils/aqi.py`.
  - `0 – 50`: **Good** (`good`, green)
  - `51 – 100`: **Moderate** (`moderate`, yellow)
  - `101 – 150`: **Unhealthy for Sensitive Groups** (`sensitive_unhealthy`, orange)
  - `151 – 200`: **Unhealthy** (`unhealthy`, red)
  - `201 – 300`: **Very Unhealthy** (`very_unhealthy`, purple)
  - `301+`: **Hazardous** (`hazardous`, maroon)
  - `None / Invalid`: **Unavailable** (`unavailable`, gray)
- **Decoupled Architecture:** The backend computes and returns the interpretation (`category`, `severity_key`, `color_token`, `guidance`). The frontend strictly maps `severity_key` to Tailwind CSS styles via `frontend/src/utils/severity.js`. **No numerical AQI thresholds are duplicated on the frontend.**

---

## 5. Project Directory Structure

```text
AirAware/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application factory & routes
│   │   ├── config.py                   # Pydantic Settings configuration
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── aqi.py                  # GET /api/air-quality
│   │   │   ├── geocoding.py            # GET /api/geocoding/search
│   │   │   ├── routines.py             # GET /api/routines
│   │   │   ├── hacks.py                # GET /api/hacks
│   │   │   ├── alternatives.py         # GET /api/alternatives
│   │   │   ├── impact.py               # POST /api/impact/calculate
│   │   │   └── assistant.py            # POST /api/assistant/query
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── open_meteo.py           # Async Open-Meteo client & parser
│   │   │   ├── recommendations.py      # Routines, hacks, alternatives & impact math
│   │   │   └── rule_assistant.py       # Rule-based clean air knowledge engine
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── aqi.py                  # Pydantic models for AQI, weather & trends
│   │   │   ├── geocoding.py            # Geocoding search models
│   │   │   ├── routines.py             # Lifestyle routine schemas
│   │   │   ├── hacks.py                # Indoor hack schemas
│   │   │   ├── alternatives.py         # Sustainable alternative schemas
│   │   │   ├── impact.py               # Impact calculator schemas
│   │   │   └── assistant.py            # Assistant query & response schemas
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── aqi.py                  # Centralized US AQI thresholds & guidance
│   │       └── weather.py              # WMO weather code interpreter
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                 # Pytest fixtures & sys.path setup
│   │   ├── test_aqi_utils.py           # Threshold boundary & null handling tests
│   │   ├── test_weather_utils.py       # WMO code translation & day/night tests
│   │   ├── test_open_meteo_service.py  # Respx-mocked external API tests
│   │   ├── test_recommendations.py     # Routine & impact calculation tests
│   │   └── test_api_endpoints.py       # Full FastAPI endpoint integration tests
│   ├── requirements.txt                # Pinned production dependencies
│   ├── requirements-dev.txt            # Pinned test & development dependencies
│   └── Dockerfile                      # Python 3.11 slim containerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js               # Clean async API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive header, logo & tab navigation
│   │   │   ├── Footer.jsx              # CC BY 4.0 attribution & medical disclaimer
│   │   │   ├── LocationSearch.jsx      # Debounced geocoding search + presets + GPS
│   │   │   ├── AQIBadge.jsx            # Prominent US AQI badge & advisory chips
│   │   │   ├── WeatherWidget.jsx       # Local temperature, humidity, wind & icons
│   │   │   ├── PollutantGrid.jsx       # Dynamic sensor cards with API units
│   │   │   └── AQITrendChart.jsx       # Recharts 4-day hourly trajectory chart
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx       # Real-time smog monitor & quick actions
│   │   │   ├── RoutinesPage.jsx        # 5 lifestyle-tailored low-emission schedules
│   │   │   ├── HacksPage.jsx           # Evidence-based indoor clean air hacks
│   │   │   ├── AlternativesPage.jsx    # Comparative sustainable swaps
│   │   │   ├── ImpactPage.jsx          # Interactive stewardship calculator
│   │   │   └── AssistantPage.jsx       # Labeled rule-based clean air assistant
│   │   ├── utils/
│   │   │   └── severity.js             # Single severity-to-Tailwind style mapper
│   │   ├── App.jsx                     # Top-level state & layout controller
│   │   ├── index.css                   # Tailwind v3 directives & custom scrollbars
│   │   └── main.jsx                    # React 18 DOM mount
│   ├── index.html
│   ├── package.json                    # Pinned frontend dependencies
│   ├── postcss.config.js
│   ├── tailwind.config.js              # Tailwind v3 configuration
│   ├── vite.config.js                  # Vite 5 configuration with proxy
│   ├── nginx.conf                      # Production SPA routing & API proxy
│   └── Dockerfile                      # Multi-stage production containerfile
│
├── docker-compose.yml                  # Full-stack container orchestration
└── README.md                           # Documentation & architecture guide
```

---

## 6. Getting Started Locally

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+ / 20+** and `npm` installed

### Step 1: Clone or Navigate to the Workspace
```powershell
cd d:\Projects\AirAware
```

### Step 2: Set Up Backend
```powershell
# Navigate to backend
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows PowerShell
# source venv/bin/activate    # On Linux / macOS

# Install dependencies
python -m pip install -r requirements.txt
python -m pip install -r requirements-dev.txt

# Run the FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`.  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`.

### Step 3: Set Up Frontend
Open a second PowerShell window:
```powershell
cd d:\Projects\AirAware\frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend application will be live at `http://localhost:3000`.

---

## 7. Running the Verification Test Suites

### Backend Unit & Integration Tests (Pytest + Respx)
The backend test suite executes 28 comprehensive automated tests covering threshold boundaries, null values, geocoding absence, and mock endpoints:
```powershell
python -m pytest backend/tests -v
```
*Expected Result: 28 passed.*

### Frontend Production Build Verification
Verify that Vite compile, asset bundling, and PostCSS / Tailwind processing pass cleanly without syntax errors:
```powershell
npm run build --prefix frontend
```
*Expected Result: Production bundle generated cleanly in `frontend/dist/`.*

---

## 8. Docker Deployment

Deploy the entire stack with a single command via Docker Compose:

```bash
docker compose up --build -d
```

- **Frontend:** `http://localhost:3000` (Nginx serving SPA and proxying `/api/`)
- **Backend API:** `http://localhost:8000/api/`
- **Swagger Docs:** `http://localhost:8000/docs`

To tear down:
```bash
docker compose down
```

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and Open-Meteo license attribution. |
| `GET` | `/api/health` | Service health status. |
| `GET` | `/api/air-quality?latitude=28.61&longitude=77.20&city=Delhi` | Fetches real-time US AQI, pollutants, weather & 4-day hourly trend data. |
| `GET` | `/api/geocoding/search?name=Delhi&count=5` | Searches locations worldwide (safely returns `[]` when not found). |
| `GET` | `/api/routines?aqi=180&lifestyle=commuter` | Lifestyle-tailored low-emission routine with inversion advisory. |
| `GET` | `/api/hacks?aqi=210` | Evidence-based indoor clean air hacks & golden rules. |
| `GET` | `/api/alternatives` | Curated catalog of sustainable winter swaps and avoided emissions. |
| `POST` | `/api/impact/calculate` | Computes weekly CO₂ savings, PM2.5 prevented & personal exposure drop. |
| `POST` | `/api/assistant/query` | Rule-based clean air knowledge assistant (*clearly labeled non-AI*). |

---

## 10. Roadmap & Future Phases

- **Phase 4 (Persistence):** PostgreSQL with SQLAlchemy / Alembic migrations to store user preferences, saved locations, and historical impact tracking.
- **Phase 5 (GenAI Integration):** Secure integration of Google Gemini API for natural-language multi-turn smog advisory dialogues once authorized.
- **Phase 6 (IoT Sensors):** Webhook support for personal indoor air monitors (PurpleAir, Sensirion, AirVisual).

---

## 11. License & Attribution

- **AirAware Application Code:** Distributed under the MIT License.
- **Data Provider Attribution:** Powered by [Open-Meteo](https://open-meteo.com/) under the [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/) license.
