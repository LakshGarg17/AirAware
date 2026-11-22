# AirAware Production Deployment Guide

This guide covers production deployment of AirAware with the **Frontend on Vercel** and the **Backend on Render**.

```
                ┌───────────────────────────────────┐
                │          Vercel Frontend          │
                │     (React 18 + Vite + Tailwind)  │
                └─────────────────┬─────────────────┘
                                  │ HTTPS Requests
                                  ▼
                ┌───────────────────────────────────┐
                │           Render Backend          │
                │        (FastAPI + Uvicorn)        │
                └───────────┬───────────┬───────────┘
                            │           │
            Open-Meteo APIs │           │ Google Gemini API
            (No key needed) ▼           ▼ (Optional - Flash tier)
```

---

## 1. Backend Deployment on Render

### Step 1: Connect Repository to Render
1. Sign in to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository containing AirAware.
4. If using Blueprint, Render automatically detects `render.yaml`.
5. If creating a manual Web Service:
   - **Name**: `airaware-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`

### Step 2: Configure Environment Variables in Render
In the Web Service settings under **Environment**:

| Key | Suggested Value | Notes |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Enables production safeguards |
| `CORS_ORIGINS` | `["https://your-airaware.vercel.app"]` | Restricts CORS to your Vercel URL |
| `AI_ENABLED` | `true` | Enables AI subsystem |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Current high-speed low-latency Gemini model |
| `GEMINI_API_KEY` | *[Your Secret Key]* | Leave empty if operating in 100% rule-based mode |
| `RATE_LIMIT_PER_MINUTE` | `20` | Protects AI chat endpoints |
| `AI_TIMEOUT_SECONDS` | `20` | Hard async timeout |
| `AI_MAX_OUTPUT_TOKENS` | `2048` | Caps response length |

---

## 2. Frontend Deployment on Vercel

### Step 1: Import Project into Vercel
1. Sign in to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Select your repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or `./` with `vercel.json` in root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables in Vercel
In Vercel **Settings → Environment Variables**:
- `VITE_API_BASE_URL`: `https://airaware-backend.onrender.com` (your live Render backend URL)

### Step 3: Verify SPA Rewrites
`frontend/vercel.json` automatically handles client-side routing rewrites so that deep links (`/planner`, `/impact`, `/assistant`) do not return 404s.

---

## 3. Local Docker Compose Deployment
To run the full stack locally using Docker:
```bash
# Optional: Set Gemini API key in your shell
$env:GEMINI_API_KEY="your_api_key_here"

# Build and start services
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

---

## 4. Operational Playbooks

### 4.1 AI Provider Outage or Key Expiry (Zero Downtime Rollback)
If the Gemini API encounters upstream outages, quota limits, or key revocation:
1. In the Render Dashboard, change `AI_ENABLED` to `false` (or simply clear `GEMINI_API_KEY`).
2. Trigger a zero-downtime redeploy.
3. AirAware instantly falls back to the deterministic rule engine without throwing 500 errors to users. The frontend displays the truthful `"Rule-based guidance"` badge automatically.

### 4.2 Verifying Deployment Health
Run the automated smoke test suite against your staging or production instance:
```bash
python scripts/smoke_test.py --base-url https://airaware-backend.onrender.com
```
