# AirAware Impact Measurement Methodology

## 1. Core Philosophy: Truth in Quantification
Many consumer sustainability tools make false, unscientific claims (e.g. "by clicking this button, you saved 4.2 kg of CO2 and reduced your PM2.5 inhalation by 48%"). 

In atmospheric chemistry and epidemiological exposure modeling:
- Inhaled particulate mass depends on micro-environmental air exchanges, minute ventilation volume, tidal lung capacity, facial seal leakage factors, and temporal concentration variations.
- Avoided vehicular emissions depend on specific engine displacement, cold-start cycles, fuel octane/cetane ratings, and fleet congestion dynamics.

**The AirAware Rule**: We refuse to invent or show fake, unverified numerical emission or exposure statistics. Instead, we measure **verified behavioral action frequencies** across two strictly segregated scientific categories.

---

## 2. Categorization of Climate & Health Actions

### Category A: Personal Exposure Reduction
*Direct, immediate biological defenses that lower respiratory and cardiovascular pollutant uptake.*
- **Actions**:
  - `mask_worn`: High-efficiency N95 / FFP2 respirator worn during outdoor exposure.
  - `air_purifier_run`: Running a mechanical HEPA purifier in active living/sleeping zones.
  - `indoor_workout`: Transitioning cardiovascular cardio routines indoors during peak AQI.
  - `windows_sealed`: Securing window and door perimeters during inversion spikes.
  - `wet_mopping`: Wet-mopping floors to suppress settled respirable dust without aerosolization.

### Category B: Environmental & Community Contribution
*Actions that reduce local primary emissions and protect neighborhood air quality.*
- **Actions**:
  - `metro_transit`: Choosing electric rapid transit over personal combustion transport.
  - `carpooled`: Sharing passenger vehicle trips to reduce localized vehicle-miles traveled.
  - `walked_cycled`: Active zero-emission short-distance trips under safe AQI conditions.
  - `no_biomass_burning`: Utilizing electric heating/cooking instead of solid fuel combustion.
  - `energy_conserved`: Reducing peak grid electricity draw to lessen peaker plant emissions.

---

## 3. The 7-Day Activity Trend Rule
The UI displays a 7-day activity bar chart showing daily verified action counts.

### Honest Rendering Constraint:
- If the user has logged actions across fewer than **2 distinct calendar days**, the chart is **deliberately not rendered**.
- Instead, the UI displays an educational empty state:
  > *"Log actions on at least 2 distinct days to reveal your 7-day activity progression."*
- This prevents misleading or uninformative single-bar visualizations.

---

## 4. Milestone & Achievement Badges
All user achievements are calculated deterministically from verified action logs:
- **Respirator Discipline**: Worn an N95 respirator on 5 distinct smoggy days.
- **Clean Commuter**: Utilized electric transit or active mobility for 5 logged trips.
- **Sanctuary Keeper**: Operated indoor air purification across 3 consecutive days.
- **Dust Suppressor**: Replaced dry sweeping with wet-mopping 3 times.
- **Clean Air Champion**: Logged 10+ total proactive actions.
