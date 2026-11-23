# AirAware Day 7 — Initial Reconnaissance & Baseline Audit
**Generated:** 2026-11-23  
**Status:** Factual Baseline Record (Pre-Fix)

---

## 1. Architecture Overview
AirAware is a full-stack smog response application:
- **Frontend (`frontend/`)**: React 18.3.1 SPA with Vite 5.4.11, Tailwind CSS 3.4.17, Recharts 2.12.7, Lucide-React 0.344.0. Storage abstraction (`StorageAdapter` / `LocalStorageManager`) over browser localStorage for user profiles, planner completions, and impact logs.
- **Backend (`backend/`)**: FastAPI 0.115.6, Pydantic v2 (2.10.4), HTTPX 0.28.1, Google GenAI SDK (`google-genai==3.6.1`). Completely stateless: no server-side databases or user tables. Deterministic US AQI engine (`app/utils/aqi.py`), Open-Meteo integration with in-memory TTL caching, in-memory rate limiting, and hybrid Gemini Flash provider with deterministic safety priority merge.
- **Deployment**: Configured for Render (`render.yaml`) for backend, Vercel (`vercel.json`) for frontend SPA.

---

## 2. Feature-to-File Implementation Map

| Feature | Routes / APIs | Backend Components | Frontend Pages / Components | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Live AQI & Weather Dashboard** | `GET /api/air-quality`<br>`GET /api/geocoding/search` | `routers/aqi.py`<br>`routers/geocoding.py`<br>`services/open_meteo.py`<br>`utils/aqi.py`, `utils/weather.py` | `DashboardPage.jsx`<br>`AQIBadge.jsx`, `AQITrendChart.jsx`<br>`WeatherWidget.jsx`, `PollutantGrid.jsx`<br>`LocationSearch.jsx` | **IMPLEMENTED** |
| **Personalized Daily Planner** | `POST /api/plan/daily` | `routers/planner.py`<br>`schemas/planner.py` | `DailyPlanPage.jsx`<br>`hooks/usePlan.js` | **IMPLEMENTED** |
| **Indoor Air Hacks** | `GET /api/indoor/tips` | `routers/indoor.py`<br>`services/recommendations.py` | `IndoorAirPage.jsx` | **IMPLEMENTED** |
| **Sustainable Living Swaps** | `GET /api/sustainable/recommendations`<br>`POST /api/sustainable/recommendations` | `routers/sustainable.py`<br>`services/recommendations.py` | `SustainableLivingPage.jsx` | **IMPLEMENTED** |
| **Verified Impact Tracker** | `GET /api/impact/catalog`<br>`POST /api/impact/summary` | `routers/impact.py`<br>`services/impact_catalog.py`<br>`schemas/impact.py` | `ImpactTrackerPage.jsx`<br>`hooks/useImpact.js` | **IMPLEMENTED** |
| **Gemini AI Assistant & Context** | `POST /api/ai/chat`<br>`POST /api/ai/recommendations` | `routers/ai.py`<br>`ai/service.py`, `ai/validator.py`<br>`ai/context_builder.py`<br>`services/providers/gemini.py` | `AIAssistantPage.jsx`<br>`hooks/useChat.js` | **IMPLEMENTED** |
| **Profile & Personalization Storage**| `POST /api/profile/validate` | `routers/profile.py`<br>`schemas/profile.py` | `ProfileDrawer.jsx`<br>`hooks/useProfile.js`<br>`storage/localStorageAdapter.js` | **IMPLEMENTED** |
| **Health & Introspection** | `GET /api/health` | `main.py`, `config.py` | `Footer.jsx` | **IMPLEMENTED** |

---

## 3. Baseline Test & Build Results

### 3.1 Backend Tests (Pytest)
- **Command**: `python -m pytest backend/tests -v`
- **Output**: 51 passed in 4.04s (0 failed, 0 errors, 0 skipped).
- **Coverage**: AQI breakpoints, Open-Meteo service parsing, stateless profile normalization, planner schedule periods, impact summaries, AI context building, safety validator, rate limiting, and weather utils.

### 3.2 Frontend Tests (Vitest)
- **Command**: `npm test --prefix frontend -- --run`
- **Output**: 5 passed, 9 failed (out of 14 tests across 6 files).
- **Failure Cause**: `TypeError: Cannot read properties of undefined (reading 'clear')` at `window.localStorage.clear()`.
- **Root Cause**: `frontend/src/test/setup.js` lacks a `window.localStorage` mock in the Node.js / jsdom test environment.

### 3.3 Frontend Production Build (Vite)
- **Command**: `npm run build --prefix frontend`
- **Output**: Succeeded in 8.45s.
  - `dist/index.html` (0.81 kB)
  - `dist/assets/index-W8VnwsEt.css` (45.58 kB)
  - `dist/assets/index-BPdUPCH_.js` (635.00 kB)
  - Notice: Bundle chunk exceeds 500 kB warning; can benefit from code-splitting or manual chunking.

### 3.4 Backend Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `200 OK`
- **Payload**: `{"status": "healthy", "version": "1.0.0", "environment": "development", "ai": {"enabled": true, "configured": false}}`
- **Observation**: No API secrets or internal keys exposed. Boolean flags only.

---

## 4. Known Problems & Audit Observations

1. **Frontend Test Environment**:
   - `frontend/src/test/setup.js` does not polyfill `window.localStorage`, breaking test suites that test profile, planner, and storage adapter isolation.
2. **Standard Error Schema Consistency**:
   - Section 1 specifies standard error JSON `{error: {code, message}}`. FastAPI's default HTTPException raises `{"detail": "..."}` unless an exception handler normalizes it. Need to verify global exception handler in `backend/app/main.py`.
3. **CORS Configuration**:
   - `CORS_ORIGINS` currently defaults to `["*"]` in production environment settings in `render.yaml` and `docker-compose.yml`. Section 4 requires explicit origins from `ALLOWED_ORIGINS` or regex for Vercel previews with no permissive wildcard.
4. **Security Headers**:
   - Need to ensure `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY` are defined in `frontend/vercel.json` and backend middleware.
5. **Client-Side API Base URL & Cold Starts**:
   - `frontend/src/api/client.js` needs audit for cold-start messaging, trailing slash normalization, and failure isolation.
6. **Rate Limiter Multi-Worker Notice**:
   - In-memory rate limiter is per-process; works for single-instance Render free tier but needs explicit architectural documentation for future horizontal scaling.


---

## 5. Post-Fix Verification (Day 7 Remediation Complete)

Following the Day 7 audit, all identified issues were remediated and verified:
1. **Frontend Test Environment**: Added complete in-memory `localStorage` mock to `frontend/src/test/setup.js`. All 14 Vitest tests pass in 3.79s.
2. **Central API Client**: All frontend hooks and pages updated to route through `frontend/src/api/client.js`, respecting `VITE_API_BASE_URL` with trailing slash normalization, cold-start retries, and normalized error parsing.
3. **Standard Error Schema**: FastAPI `main.py` now catches `StarletteHTTPException` and `RequestValidationError`, returning `{error: {code, message}}`.
4. **CORS & Security Headers**: Strict origin parsing via `ALLOWED_ORIGINS` / `CORS_ORIGINS`, Vercel preview domain regex, and security headers applied across `vercel.json` and backend middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
5. **Open-Meteo Resilience**: 15-minute in-memory caching, transient error retries, upstream 429 friendly mapping, and isolated weather partial failure handling added.
6. **Rate Limiting**: `Retry-After: 60` header attached to 429 responses, and `reset_rate_limits()` added for test isolation.
7. **Smoke Tests in 3 Modes**: `scripts/smoke_test.py` verified 12/12 passing in `normal`, `ai-disabled`, and `invalid-key` modes.
8. **Final Backend Test Count**: Increased from 51 to **58 passed** tests with zero failures.
