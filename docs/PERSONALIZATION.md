# AirAware Personalization & Lifestyle Engine

## 1. Architectural Philosophy: Stateless Backend
Modern serverless and free-tier container hosting environments (such as Render) deploy apps on ephemeral filesystems without persistent disks. Storing user profiles and private lifestyle data in a server-side SQLite or flat file database introduces serious hazards:
1. **Data Loss**: Container restarts and redeploys wipe local filesystems.
2. **Data Leakage & Multi-Tenancy Mixing**: Without complex user authentication (JWT/OAuth), unauthenticated requests sharing a single database risk cross-polluting profile data between users.
3. **Privacy Exposure**: Storing user home ventilation, children/elderly presence, and commute patterns on a central server creates unnecessary liability.

### Solution: Client-Side Storage + Stateless Validation
- User profiles live exclusively in the user's browser behind a robust `StorageAdapter` pattern.
- The backend remains completely stateless: endpoints like `POST /api/profile/validate` and `POST /api/plan/daily` receive the profile with the request, validate/normalize it, compute personalized recommendations, and return the response.
- If storage is blocked (e.g., privacy mode or disabled cookies), an in-memory fallback ensures the application never crashes.

---

## 2. User Profile Schema & Enums

The profile is strictly typed and validated both in frontend React state and via backend Pydantic models:

| Field | Type / Enum | Description |
| :--- | :--- | :--- |
| `sensitive_group` | `none`, `asthma`, `respiratory`, `cardiovascular`, `pregnant` | Vulnerable physiological conditions |
| `has_children` | `boolean` | Presence of children under 12 in household |
| `has_elderly` | `boolean` | Presence of adults aged 65+ in household |
| `commute_mode` | `work_from_home`, `public_transit`, `car_sealed`, `two_wheeler`, `walk_cycle` | Daily transportation modality |
| `work_environment`| `indoor_conditioned`, `indoor_naturally_ventilated`, `mixed_indoor_outdoor`, `outdoor` | Occupational exposure context |
| `outdoor_exercise`| `morning`, `evening`, `flexible`, `indoor_only`, `avoid` | Physical activity preferences |
| `housing_type` | `apartment_sealed`, `apartment_open`, `independent_house`, `slum_unsealed` | Building envelope filtration capability |
| `has_air_purifier`| `boolean` | Availability of mechanical air purification |

---

## 3. Personalized Daily Planner (`POST /api/plan/daily`)

The planner organizes the day into four chronological periods:
1. **Morning (06:00 – 10:00)**: Focuses on winter thermal inversion warnings, commute precautions, and avoiding early-morning outdoor physical activity.
2. **Midday (10:00 – 14:00)**: Evaluates peak solar radiation, potential ozone rises, and opportunistic window ventilation when daytime temperature breaks the boundary layer.
3. **Evening (14:00 – 20:00)**: Addresses evening rush hour smog surge, secondary particulate settling, and commute route protection.
4. **Night (20:00 – 06:00)**: Concentrates on nocturnal indoor air quality, bedroom air sealing, air purifier nighttime operation, and wet-mopping dust suppression.

### Deterministic Action IDs & Progress State
Every generated action carries a stable 12-character deterministic hex ID (`action_id = hashlib.sha256(f"{period}_{title}_{action_key}".encode()).hexdigest()[:12]`). 
This guarantees:
- Checkbox completions persist reliably in browser localStorage across page reloads.
- Regenerating a plan with a new `variation_seed` maintains completion states for matching actions.

---

## 4. Indoor Air Quality Hacks (`GET /api/indoor/tips`)
Categorized by economic barrier:
- **Free**: Damp towel door draft blocking, exhaust fan operational timing, cross-ventilation windows during optimal AQI troughs, no-fry cooking protocols.
- **Low-Cost**: DIY MERV-13 filter box fan builds, weatherstripping tapes, indoor hygrometer monitoring.
- **Equipment**: Certified H13 True-HEPA purifiers, carbon VOC absorption canisters, sealed filter placement away from room corners.

### The 4 Golden Rules of Indoor Air:
1. Never burn incense, candles, or mosquito coils indoors during smog episodes.
2. Wet-mop surfaces instead of dry sweeping (dry sweeping aerosolizes settled PM2.5).
3. Do not run ozone-generating air "ionizers".
4. Monitor indoor humidity between 30% and 50% to prevent mold and airway irritation.

---

## 5. Sustainable Living Alternatives (`GET /api/sustainable/recommendations`)
Promotes practical, non-judgmental habits with direct local emission reductions:
- **Commute**: Metro / public electric bus over single-occupancy vehicles.
- **Heating**: Oil-filled radiators or heat pumps over wood/biomass fire braziers.
- **Waste**: Composting and municipal collection over leaf/trash burning.
- **Household**: Natural fragrance diffusion over aerosol chemical sprays.
