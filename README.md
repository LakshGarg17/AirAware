# AirAware — Winter Smog Navigation & Clean Air Action Platform
**Breathe smarter. Live better.**

> **PromptWars Virtual | Main Challenge 06 (Days 1 – 7 Complete & Production Ready)**  
> *A deployment-ready, full-stack platform empowering families, daily commuters, and urban communities to navigate severe winter smog with personalized routines, indoor air protection, sustainable swaps, verified impact tracking, hybrid Gemini AI intelligence, and audited security.*

---

## 1. Product Overview

During winter months across smog-prone metropolitan basins, nocturnal thermal radiation inversions trap vehicle exhaust, biomass smoke, and industrial particulate matter in the lowest 50–100 meters of the atmosphere. Ambient PM2.5 concentrations routinely spike to hazardous levels (US AQI > 200–400+), presenting severe acute cardiovascular and respiratory health risks.

**AirAware** is more than an AQI scoreboard. It is an intelligent clean-air navigation companion featuring:
1. **Live Air Quality & 4-Day Trajectory (`/`)**: Displays real-time **US AQI**, target pollutants (PM2.5, PM10, NO₂, SO₂, CO, O₃), and localized weather conditions powered by Open-Meteo with dynamic units. Features a 4-day hourly trajectory chart (-2 past days, +2 forecast days) and thermal inversion alerts.
2. **Personalized Daily Planner (`/planner`)**: Structures daily schedules across four time periods (Morning, Midday, Evening, Night) customized by commute, housing, family vulnerability, and physical activity habits. Features stable action IDs, checkbox persistence, variation-seeded regeneration, and one-click logging to the impact tracker.
3. **Indoor Air Protection (`/indoor`)**: Actionable interventions categorized by economic cost (Free, Low-Cost, Equipment), outdoor-AQI contextual advice, and the 4 non-negotiable Golden Rules of indoor air.
4. **Sustainable Living Alternatives (`/sustainable`)**: Conventional vs. clean lifestyle swaps (commute, heating, waste, household) with positive reinforcement and direct emissions reduction explanations.
5. **Verified Impact Tracker (`/impact`)**: Rigorous count-based behavioral tracking with absolute scientific integrity (zero fabricated emission formulas). Strict separation between **Category A (Personal Exposure Reduction)** and **Category B (Environmental Contribution)**, 7-day activity chart rendered only when ≥ 2 distinct days of data exist, action log with delete/undo, and data-backed achievements.
6. **AI Assistant (`/assistant`)**: Context-aware conversational assistant powered by Google's **Gemini 2.5 Flash** via the official `google-genai` SDK. Fully protected with prompt injection defenses, coordinate truncation, in-memory rate limiting, banned claims safety filtering, and honest source badging (`AI-generated` vs `Rule-based guidance`).

---

## 2. Tech Stack & Pinned Versions

### Frontend (`frontend/`)
- **Framework & Tooling:** React 18.3.1, Vite 5.4.11
- **Language:** JavaScript (ES Modules, strictly no TypeScript)
- **Styling:** Tailwind CSS 3.4.17 + PostCSS 8.4.49 + Autoprefixer 10.4.20 (Tailwind v3)
- **Icons:** `lucide-react` 0.344.0
- **Data Visualization:** `recharts` 2.12.7 (Responsive hourly trajectory and 7-day activity bar charts)
- **State & Storage:** Client-side `StorageAdapter` with `localStorage` and in-memory fallback
- **Testing:** `vitest` 2.1.8, `@testing-library/react` 16.1.0, `jsdom` 25.0.1

### Backend (`backend/`)
- **Runtime:** Python 3.11+
- **Web Framework:** FastAPI 0.115.6, Uvicorn 0.34.0
- **Validation & Settings:** Pydantic v2 (2.10.4), Pydantic Settings (2.7.0)
- **HTTP Client:** `httpx` 0.28.1 (fully async)
- **AI SDK:** `google-genai` 3.6.1 (modern Google GenAI SDK, async client)
- **Testing:** `pytest` 8.3.4, `pytest-asyncio` 0.25.0, `respx` 0.22.0

---

## 3. Architecture & Key Decisions

### 3.1 Stateless Backend & Browser Persistence
Render free tier instances run on ephemeral filesystems and lack user authentication. Storing user profiles and action logs in a central server database would cause data loss upon container restart and leak or mix unauthenticated users' private lifestyle data.
- **Client Storage (`frontend/src/storage/`)**: User profiles, planner completion states, and action logs are stored strictly on the client using a versioned schema, automated 31-day data pruning, and an in-memory fallback.
- **Stateless Endpoints**: The backend accepts profile payloads on each request, performs validation and normalization, and returns personalized results without server-side database writes.

### 3.2 Deterministic Safety Ownership & Honest AI Badging
- The deterministic backend layer exclusively owns US AQI calculation, standard breakpoint interpretations, severity tokens, and life-critical exposure safeguards (e.g. N95 respirator advice during hazardous smog).
- When Gemini AI is enabled and configured, AI recommendations are merged such that **critical deterministic items are always placed first and cannot be overridden or downgraded**.
- Every response metadata contains `source: "ai" | "rules"` and `fallback_reason`. The UI honestly badges responses as `AI-generated` or `Rule-based guidance` and never mislabels rule output as AI.

### 3.3 Authentic Impact Tracking (Zero Fabricated Metrics)
- Atmospheric exposure and carbon savings depend on complex micro-environmental air exchanges, fuel types, and traffic cycles.
- AirAware **refuses to fabricate synthetic "kg CO2 saved" or "PM2.5 prevented" numbers**. Instead, it tracks verified user-logged action counts across Category A (Exposure Reduction) and Category B (Environmental Contribution).

---

## 4. Directory Structure

```
AirAware/
├── .env.example                  # Root environment variable template
├── docker-compose.yml            # Multi-container orchestration (frontend + backend)
├── render.yaml                   # Render deployment blueprint for backend
├── vercel.json                   # Vercel SPA deployment configuration
├── README.md                     # Comprehensive documentation
├── docs/                         # Architectural documentation
│   ├── AI_ARCHITECTURE.md        # Gemini integration, safety filters & fallback
│   ├── PERSONALIZATION.md        # Profile schema, lifestyle enums & planner
│   ├── IMPACT_METHODOLOGY.md     # Count-based metrics & Category A/B rationale
│   └── deployment.md             # Vercel & Render step-by-step production deployment
├── scripts/
│   └── smoke_test.py             # Automated end-to-end API smoke test suite
├── backend/                      # FastAPI Python Application
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Testing & development dependencies
│   ├── Dockerfile                # Production container specification
│   ├── app/
│   │   ├── config.py             # Pydantic v2 settings & AI configuration
│   │   ├── main.py               # FastAPI entrypoint & router aggregation
│   │   ├── ai/                   # Gemini AI Subsystem
│   │   │   ├── context_builder.py# PII stripping & coordinate truncation
│   │   │   ├── prompt_builder.py # System instructions & XML delimiter isolation
│   │   │   ├── validator.py      # Banned claims & safety filter
│   │   │   └── service.py        # Async client, caching & rate limiting
│   │   ├── routers/              # API route definitions
│   │   │   ├── aqi.py            # /api/air-quality
│   │   │   ├── geocoding.py      # /api/geocoding/search
│   │   │   ├── profile.py        # /api/profile/validate
│   │   │   ├── planner.py        # /api/plan/daily
│   │   │   ├── indoor.py         # /api/indoor/tips
│   │   │   ├── sustainable.py    # /api/sustainable/recommendations
│   │   │   ├── impact.py         # /api/impact/catalog & /api/impact/summary
│   │   │   └── ai.py             # /api/ai/chat & /api/ai/recommendations
│   │   ├── schemas/              # Pydantic request & response models
│   │   ├── services/             # Recommendation providers & open-meteo integration
│   │   └── utils/                # AQI breakpoints & weather code mappings
│   └── tests/                    # 51 unit & integration pytest tests
└── frontend/                     # React 18 + Vite SPA
    ├── package.json              # Pinned npm dependencies
    ├── vite.config.js            # Vite build configuration & test setup
    ├── tailwind.config.js        # Tailwind CSS v3 configuration
    ├── Dockerfile & nginx.conf   # Production static frontend container
    ├── src/
    │   ├── storage/              # Client-side StorageAdapter & localStorage engine
    │   ├── hooks/                # useProfile, usePlan, useImpact, useChat
    │   ├── components/           # Navbar, Footer, LocationSearch, AQIBadge, etc.
    │   ├── pages/                # Dashboard, DailyPlan, IndoorAir, Sustainable, Impact, AI
    │   └── test/                 # 14 Vitest component & storage unit tests
```

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check returning status and AI availability metadata. |
| `GET` | `/api/air-quality` | Real-time US AQI, target pollutants, weather, and 4-day trajectory. |
| `GET` | `/api/geocoding/search` | Location search with Open-Meteo geocoding. |
| `POST` | `/api/profile/validate` | Validates, normalizes, and sanitizes user profile without server persistence. |
| `POST` | `/api/plan/daily` | Generates 4-period personalized schedule with stable 12-char hex IDs. |
| `GET` | `/api/indoor/tips` | Free, Low-Cost, and Equipment indoor air quality interventions. |
| `GET` | `/api/sustainable/recommendations` | Practical non-judgmental clean lifestyle alternatives. |
| `GET` | `/api/impact/catalog` | Master definitions for Category A and Category B actions. |
| `POST` | `/api/impact/summary` | Stateless calculation of daily counts, category breakdowns, and achievements. |
| `POST` | `/api/ai/chat` | Safe conversational clean air assistant with prompt injection defenses. |
| `POST` | `/api/ai/recommendations` | Context-aware recommendations merging Gemini Flash with deterministic safeguards. |

---

## 6. Quickstart & Local Setup

### 6.1 Prerequisites
- Python 3.11+
- Node.js 18+ (tested on Node 20 / 22 / 26)
- Git

### 6.2 Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Linux/macOS: source venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Copy environment variables (optional: add your GEMINI_API_KEY)
copy .env.example .env

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000`. Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 6.3 Frontend Setup
```powershell
# Open a new terminal in frontend directory
cd frontend

# Install pinned dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

### 6.4 Docker Compose Setup
Run both frontend and backend in production-mirrored containers:
```powershell
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 7. Testing & Verification

### 7.1 Backend Tests (Pytest)
AirAware features 58 unit and integration tests covering AQI thresholds, Open-Meteo parsing and caching, stateless profile validation, daily planner generation, impact summaries, AI context building, prompt injection defense, rate limiting, security headers, CORS origin enforcement, and rule fallback:
```powershell
python -m pytest backend/tests -v
```

### 7.2 Frontend Tests (Vitest)
Unit and component tests verify localStorage recovery, corrupt JSON healing, anti-double-tap protection, 31-day pruning, profile resets, planner state persistence, and chat message rendering:
```powershell
npm test --prefix frontend -- --run
```

### 7.3 Production Build
Verify Vite bundles production assets cleanly with zero errors:
```powershell
npm run build --prefix frontend
```

### 7.4 Automated Smoke Test Suite
Run end-to-end verification against a running server across 3 operational modes (`normal`, `ai-disabled`, `invalid-key`):
```powershell
python scripts/smoke_test.py --base-url http://localhost:8000 --mode normal
```

---

## 8. Deployment

- **Frontend on Vercel**: Ready for one-click deployment with `vercel.json`, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), and automatic client-side SPA routing rewrites.
- **Backend on Render**: Declarative `render.yaml` blueprint with health check at `/api/health`, environment variable bindings, and safe non-synced `GEMINI_API_KEY`.
- For detailed deployment steps, environment tables, and rollback playbooks, see [`docs/DAY7_DEPLOYMENT_READINESS.md`](docs/DAY7_DEPLOYMENT_READINESS.md) and [`docs/DAY7_QA_REPORT.md`](docs/DAY7_QA_REPORT.md).

---

## 9. Data Attribution
Air quality, meteorological forecasts, and geocoding services are provided by the [Open-Meteo API](https://open-meteo.com/). Data is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
