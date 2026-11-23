# AirAware Day 7 — Production Deployment Runbook & Readiness Gate
**Platform:** Vercel (Frontend) & Render (Backend)  
**Status:** RELEASE-READY

---

## 1. Deployment Architecture

```
                  ┌────────────────────────────────────────┐
                  │            Vercel Frontend             │
                  │   (React 18 + Vite 5 + Tailwind v3)    │
                  │       https://airaware.vercel.app      │
                  └───────────────────┬────────────────────┘
                                      │ HTTPS JSON (CORS)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             Render Backend             │
                  │         (FastAPI + Uvicorn)            │
                  │    https://airaware-backend.onrender.com │
                  └───────────┬────────────────┬───────────┘
                              │                │
     Open-Meteo REST API (CC) │                │ Google GenAI API (Optional)
     https://air-quality-api...                │ gemini-2.5-flash
```

---

## 2. Step-by-Step Deployment Runbook

### Step 1: Deploy Backend on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint** and connect your AirAware Git repository.
   - Render automatically detects `render.yaml`.
   - Alternatively, create a **Web Service** manually:
     - **Name:** `airaware-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Python`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Health Check Path:** `/api/health`
3. Configure Backend Environment Variables (see Section 3 table).
4. For `GEMINI_API_KEY`: Click **Secret Environment Variables**, add `GEMINI_API_KEY`, and paste your Google AI Studio API key. (If testing rule-based mode only, leave it blank).
5. Click **Deploy**. Wait for build completion and verify `https://<your-render-app>.onrender.com/api/health` returns status `200` with `status: "healthy"`.

### Step 2: Copy Live Backend URL
- Note your live backend base URL: `https://<your-render-app>.onrender.com`.

### Step 3: Configure & Deploy Frontend on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Select your AirAware repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://<your-render-app>.onrender.com`
5. Click **Deploy**. Vercel will build the frontend and deploy to `https://<your-project>.vercel.app`.

### Step 4: Finalize CORS on Render
1. Return to Render Dashboard → `airaware-backend` → **Environment**.
2. Update `ALLOWED_ORIGINS` to:
   `["https://<your-project>.vercel.app"]`
3. Render will automatically redeploy with the exact origin restriction.
   *(Note: Preview deployments on `*.vercel.app` are automatically accepted via secure regex)*.

### Step 5: Run Automated Live Smoke Tests
Run the automated end-to-end smoke test suite against your live deployment:
```bash
python scripts/smoke_test.py --base-url https://<your-render-app>.onrender.com --mode normal
```

---

## 3. Environment Variables Reference Table

| Variable Name | Target Service | Required? | Default / Example | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | Render (Backend) | Yes | `production` | Enables production security safeguards |
| `ALLOWED_ORIGINS` | Render (Backend) | Yes | `["https://airaware.vercel.app"]` | Restricts CORS to authorized frontend domains |
| `AI_ENABLED` | Render (Backend) | No | `true` | Enables or disables Gemini AI subsystem |
| `GEMINI_MODEL` | Render (Backend) | No | `gemini-2.5-flash` | Configures Google GenAI model tier |
| `GEMINI_API_KEY` | Render (Backend) | Optional | `AIzaSy...` (Secret) | Google AI Studio Key (never commit to git) |
| `RATE_LIMIT_PER_MINUTE` | Render (Backend) | No | `20` | Sliding-window IP rate limit for chat |
| `AI_TIMEOUT_SECONDS` | Render (Backend) | No | `20` | Hard async timeout for AI completion |
| `AI_MAX_OUTPUT_TOKENS` | Render (Backend) | No | `2048` | Caps max token generation |
| `CHAT_MAX_MESSAGE_CHARS` | Render (Backend) | No | `500` | Enforces message length ceiling |
| `CHAT_MAX_HISTORY_TURNS` | Render (Backend) | No | `8` | Bounds memory turn history |
| `VITE_API_BASE_URL` | Vercel (Frontend) | Yes | `https://airaware-backend.onrender.com` | Central base URL for all API calls |

---

## 4. Manual Post-Deployment Verification Checklist

- [ ] **1. Dashboard**: `GET /` loads within 3 seconds, displays US AQI badge with color token, 4-day trajectory area chart, weather, and pollutant grid.
- [ ] **2. Location Search**: Search for "Delhi", "London", or "Tokyo" — results populate, clicking a city updates all dashboard widgets.
- [ ] **3. AI Assistant**:
  - Without API Key: Returns verified public health guidance with `"Rule-based guidance"` (slate) badge.
  - With API Key: Returns personalized synthesis with `"AI-generated"` (green) badge.
- [ ] **4. Profile Drawer**: Toggle sensitive group, commute mode, or housing type — click Save, refresh the page, verify changes persist.
- [ ] **5. Daily Planner**: Check off morning actions — verify progress bar updates and completion survives page refresh.
- [ ] **6. Impact Tracker**: Quick-log an action — verify Today count increments, Category A and B stay separated, and 7-day chart renders once ≥ 2 distinct days of data exist.
- [ ] **7. Browser Console**: Confirm zero CORS errors, zero unhandled promise rejections, and zero mixed-content warnings.
- [ ] **8. Mobile View**: Test on viewport width 390px — verify zero horizontal overflow and responsive drawer.

---

## 5. Zero-Downtime Rollback & Failure Mitigation Playbook

### Scenario A: Gemini Upstream Outage / Quota Exhaustion
1. In the Render Dashboard, change `AI_ENABLED` to `false` (or remove `GEMINI_API_KEY`).
2. Trigger deployment.
3. AirAware immediately shifts to 100% deterministic rule-based mode. No 500 errors occur, and the frontend transparently updates the badge to `"Rule-based guidance"`.

### Scenario B: Severe Frontend Build Bug
1. In Vercel Dashboard → **Deployments**.
2. Locate the previous stable deployment.
3. Click **...** → **Instant Rollback**. Vercel routes edge traffic to the previous build in under 5 seconds.

### Scenario C: Render Cold Starts (Free Tier)
1. Free-tier Render instances spin down after 15 minutes of inactivity.
2. The initial request after idle may take 20–40 seconds to boot.
3. AirAware's central API client (`frontend/src/api/client.js`) automatically retries transient cold-start errors, preventing UI crashes.
