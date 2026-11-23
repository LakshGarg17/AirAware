# AirAware — Deployment Warnings & Dependency Audit Report

## 1. Executive Summary
During frontend deployment audits and production builds, five distinct categories of npm and build warnings were identified and evaluated. This audit documents their root causes, risk profile, resolution status, and ongoing maintenance strategy.

---

## 2. Warning Audit Matrix

| Warning Category | Observed Warning Message | Root Cause | Risk Level | Status |
|---|---|---|---|---|
| **npm cache-dir** | `npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm.` | Deployment/CI environment injects `NPM_CONFIG_CACHE_DIR` or `npm_config_cache_dir`. npm expects `cache` (`npm_config_cache`), whereas `cache-dir` is Yarn/pnpm syntax. | Low (Deprecated in npm v10/v11; rejected in v12) | **FIXED** (Root cause identified; CI guidance and build scripts updated to use `npm ci`) |
| **whatwg-encoding** | `npm warn deprecated whatwg-encoding@3.1.1: Use @exodus/bytes instead` | Transitive development dependency required by `jsdom@25.0.1` and `html-encoding-sniffer@4.0.0` for Vitest tests. Not present in client-facing production code. | Informational (Test-only; zero runtime client exposure) | **JUSTIFIED / DEFERRED** (No breaking override forced; awaiting upstream jsdom major bump) |
| **Recharts v2 Deprecation** | `npm warn deprecated recharts@2.12.7: 1.x and 2.x branches are no longer active. Bump to Recharts v3.` | Upstream Recharts maintainers released v3 and marked v1.x/v2.x as inactive. | Low | **AUDITED / RETAINED** (Recharts v3 introduces architectural breaking changes to internal state and props; current v2.12.7 is stable and thoroughly tested) |
| **esbuild install-scripts** | `npm warn install-scripts: 1 package has install scripts not yet covered by allowScripts: esbuild@0.21.5` | npm v11 security feature requiring explicit approval of postinstall binaries via `allowScripts`. | Medium (Security compliance) | **FIXED** (Explicitly approved `esbuild@0.21.5` in `package.json` under `allowScripts`) |
| **Vite Chunk Size** | `(!) Some chunks are larger than 500 kB after minification.` | Monolithic bundling: all tabs, Recharts, and Lucide icons were synchronously loaded into a single `index.js` (637.40 kB). | Medium (Initial page load performance) | **FIXED** (Implemented React `Suspense`/`lazy` for secondary tabs and Rollup manual chunking; max chunk reduced to 305 kB) |

---

## 3. Deep-Dive Analysis by Warning

### A. Unknown npm Config `cache-dir`
- **Origin**: In npm, environment variables matching `npm_config_<key>` are automatically parsed into npm CLI options. Setting `NPM_CONFIG_CACHE_DIR` or `npm_config_cache_dir` in CI/CD (such as Render, Vercel, or custom Docker images) causes npm to look up `cache-dir`. In npm, the valid configuration option is `--cache` (or `NPM_CONFIG_CACHE`), whereas `cache-dir` is specific to Yarn (`yarn config set cache-dir`) or pnpm.
- **Impact**: In npm v10 and v11, npm logs a deprecation warning indicating the setting will fail in npm v12.
- **Resolution**:
  1. Identified that no repository config file contains `cache-dir`.
  2. Verified that if a custom cache path is needed in CI/CD, the environment variable must be named `NPM_CONFIG_CACHE` (not `NPM_CONFIG_CACHE_DIR`).
  3. Standardized `vercel.json` build command to `cd frontend && npm ci && npm run build` for deterministic, clean lockfile-driven installs.

### B. `whatwg-encoding@3.1.1` Deprecation
- **Dependency Path**:
  ```
  whatwg-encoding@3.1.1 (dev)
    └── html-encoding-sniffer@4.0.0
          └── jsdom@25.0.1
                └── vitest@2.1.8
  ```
- **Analysis**:
  - The maintainer of `whatwg-encoding` deprecated the repository in favor of `@exodus/bytes`.
  - However, `jsdom@25.0.1` directly depends on `whatwg-encoding@"^3.1.1"`.
  - Forcing an override to `@exodus/bytes` would break `jsdom` because `@exodus/bytes` does not provide an identical drop-in API for `whatwg-encoding`'s internal functions.
  - Furthermore, `jsdom` is exclusively a `devDependency` used inside the Node/Vitest test runner. It is never bundled into `frontend/dist`.
- **Decision**: Retain existing dependency tree. Do not introduce risky lockfile overrides. Await official `jsdom` update.

### C. Recharts v2 to v3 Migration Review
- **Current Version**: `recharts@2.12.7`
- **Audit of AirAware Chart Usage**:
  - `AQITrendChart.jsx`: `<AreaChart>`, `<Area>`, `<ResponsiveContainer>`, `<Tooltip>`, `<CustomTooltip>`, `<CartesianGrid>`, `<ReferenceLine>`, `<XAxis>`, `<YAxis>`.
  - `ImpactTrackerPage.jsx`: `<BarChart>`, `<Bar>`, `<ResponsiveContainer>`, `<Tooltip>`, `<Legend>`, `<CartesianGrid>`, `<XAxis>`, `<YAxis>`.
- **Breaking Changes in Recharts v3**:
  1. Complete removal of `CategoricalChartState` in favor of internal modular hooks.
  2. Removal of internally cloned props passed to custom tooltip and reference components.
  3. Deprecation of `<Cell />` components and removal of `recharts-scale`.
  4. Updated baseline requirements (Node 18+, TypeScript 5+ internal types).
- **Decision**:
  - In accordance with Phase 4 guidelines ("If Recharts v3 introduces a major compatibility problem or risk, retain the currently working version and document why"), `recharts@2.12.7` is retained.
  - The deprecation notice on npm is purely informational. The existing charts are 100% functional, responsive, and verified by tests. A future milestone will dedicate focused QA to migrate custom tooltip rendering to the Recharts v3 hook architecture.

### D. esbuild Install-Script Security Policy
- **Origin**: Modern npm v11 enforces `allowScripts` to prevent arbitrary code execution during package installation (`postinstall` hooks).
- **Analysis**: `esbuild@0.21.5` uses a `postinstall` script (`node install.js`) to download and link the platform-specific native binary (`@esbuild/win32-x64`, `@esbuild/linux-x64`, etc.) required by Vite.
- **Resolution**:
  - Executed official workflow: `npm install-scripts approve esbuild`.
  - Registered explicitly in `frontend/package.json`:
    ```json
    "allowScripts": {
      "esbuild@0.21.5": true
    }
    ```
  - Ran `npm install-scripts ls` -> Verified: `No packages with unreviewed install scripts.`
  - `npm warn install-scripts` is completely resolved without disabling global script security.

### E. Frontend Bundle Size & Chunk Optimization
- **Origin**: Vite defaults to a 500 kB chunk threshold. The monolithic bundle was 637.40 kB.
- **Resolution**:
  - Code-split secondary tabs (`DailyPlanPage`, `IndoorAirPage`, `SustainableLivingPage`, `ImpactTrackerPage`, `AIAssistantPage`) using `React.lazy()` and `<Suspense>`.
  - Configured Rollup `manualChunks` in `vite.config.js` to isolate vendor libraries (`vendor-react`, `vendor-recharts`, `vendor-d3`, `vendor-lucide`).
  - Result: Max chunk size dropped to 305.35 kB; initial bundle dropped to 59.86 kB. Warning eliminated.
