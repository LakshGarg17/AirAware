"""
Tailored Recommendations Engine.
Generates:
1. Low-emission daily routines tailored by lifestyle and current AQI severity.
2. Practical, evidence-based indoor air quality hacks.
3. Sustainable alternatives for winter smog mitigation.
4. Quantified direct impact metrics (CO2e, PM2.5 emissions, personal lung exposure reduction).
"""
from typing import Any, Dict, List, Optional
from app.utils.aqi import get_aqi_interpretation


LIFESTYLE_METADATA = {
    "general": "General Urban Resident",
    "commuter": "Daily Office Commuter",
    "family_kids": "Family with Young Children",
    "remote_worker": "Work-From-Home / Remote Professional",
    "senior": "Senior Citizens & Sensitive Individuals"
}


def get_tailored_routines(aqi_val: Optional[int], lifestyle: str = "general") -> Dict[str, Any]:
    interp = get_aqi_interpretation(aqi_val)
    sev = interp["severity_key"]
    cat = interp["category"]
    lifestyle_key = lifestyle if lifestyle in LIFESTYLE_METADATA else "general"
    lifestyle_label = LIFESTYLE_METADATA[lifestyle_key]

    morning_inversion_advisory = (
        "During winter months, ground-level thermal radiation inversions trap vehicle exhaust, "
        "industrial fumes, and dust near the surface between 6:00 AM and 9:30 AM. Ambient PM2.5 "
        "often peaks at 2x–3x midday levels. Shift outdoor ventilation and intense activities after 11:00 AM."
    )

    steps = []

    if lifestyle_key == "commuter":
        steps = [
            {
                "time_window": "06:30 - 08:30 AM",
                "activity": "Morning Preparation & Travel Window",
                "low_emission_action": "Avoid early open-window ventilation. Opt for electric rapid transit (Metro) or shared carpool rather than single-occupancy petrol/diesel car.",
                "impact_explanation": "Shifting from a solo petrol commute to electric metro cuts direct tailpipe CO2 by ~2.6 kg/day and prevents 4.5g of direct PM2.5 emissions.",
                "smog_avoidance_tip": "Wear a fitted N95 respirator during above-ground transit and platform waits. Keep car recirculation mode ON if driving.",
                "exposure_reduction": "75% reduction in commuter PM2.5 inhalation",
                "co2_saved": "2.6 kg CO2e / trip"
            },
            {
                "time_window": "09:00 - 12:00 PM",
                "activity": "Workplace Arrival & Desk Hours",
                "low_emission_action": "Ensure office HVAC intake filters are operating; run personal desktop HEPA or keep meeting room doors closed against hallway drafts.",
                "impact_explanation": "Maintaining sealed indoor environments reduces commercial building energy load spikes while safeguarding cognitive focus.",
                "smog_avoidance_tip": "Avoid smoking areas and building exterior exhaust vents during coffee breaks.",
                "exposure_reduction": "60% lower indoor PM2.5 exposure",
                "co2_saved": "0.4 kg CO2e / day"
            },
            {
                "time_window": "12:30 - 02:00 PM",
                "activity": "Lunch Hour & Midday Break",
                "low_emission_action": "Eat locally or pack a homemade tiffin instead of ordering single-use delivery motorcycles during peak traffic.",
                "impact_explanation": "Eliminates last-mile courier combustion cycles and packaging waste.",
                "smog_avoidance_tip": "Midday is when the planetary boundary layer height rises, dispersing surface smog. If you need a short walk, do it between 1:00 PM and 2:30 PM.",
                "exposure_reduction": "30% lower ambient exposure than morning peak",
                "co2_saved": "0.8 kg CO2e / order avoided"
            },
            {
                "time_window": "05:30 - 08:00 PM",
                "activity": "Evening Return Transit",
                "low_emission_action": "Avoid idling vehicle engines in evening jams. Consider flexible off-peak departure (after 7:30 PM) or staggered office hours.",
                "impact_explanation": "Engine idling burns 1.2–2.0 liters of fuel per hour with 80% higher incomplete combustion soot.",
                "smog_avoidance_tip": "Keep vehicle windows sealed; set AC to recirculate. Switch back to N95 before stepping onto street level.",
                "exposure_reduction": "70% lower vehicle cabin pollution",
                "co2_saved": "1.5 kg CO2e / trip"
            },
            {
                "time_window": "08:30 - 10:30 PM",
                "activity": "Evening Wind-Down & Sleep",
                "low_emission_action": "Turn off radiant room heaters when sleeping; use insulated thermal quilts and draft stoppers under bedroom doors.",
                "impact_explanation": "Saves 4-6 kWh of electrical grid draw per room heater per night.",
                "smog_avoidance_tip": "Run bedroom air purifier on quiet night mode. Keep bedroom doors shut.",
                "exposure_reduction": "85% lower overnight particulate exposure",
                "co2_saved": "3.2 kg CO2e / night"
            }
        ]
    elif lifestyle_key == "family_kids":
        steps = [
            {
                "time_window": "06:30 - 08:30 AM",
                "activity": "School Preparation & Morning Routine",
                "low_emission_action": "Coordinate neighborhood school busing or shared electric carpools instead of individual parents driving separate private cars.",
                "impact_explanation": "One full school bus takes approximately 36 private cars off school gate drop-off zones.",
                "smog_avoidance_tip": "Children breathe 50% more air per pound of body weight than adults. Ensure children wear properly sized child N95/KF94 masks on the way to school.",
                "exposure_reduction": "80% reduction in children's morning commute lung dose",
                "co2_saved": "3.8 kg CO2e / family / week"
            },
            {
                "time_window": "10:00 - 02:00 PM",
                "activity": "Indoor Play & School Hours",
                "low_emission_action": "Encourage schools and daycare centers to hold recess in indoor ventilated gymnasiums rather than outdoor dirt fields during smog alerts.",
                "impact_explanation": "Reduces acute pediatric asthma emergency department visits by up to 45%.",
                "smog_avoidance_tip": "Keep indoor classroom windows closed; verify HEPA filtration or DIY Corsi-Rosenthal boxes are running.",
                "exposure_reduction": "65% lower indoor particle intake",
                "co2_saved": "N/A (Health Protection)"
            },
            {
                "time_window": "04:30 - 06:30 PM",
                "activity": "After-School Sports & Activities",
                "low_emission_action": "Switch outdoor field sports (football, running) to indoor skill drills, reading, board games, or yoga on days when US AQI > 150.",
                "impact_explanation": "Intense aerobic outdoor exercise multiplies inhaled air volume by 5x-10x, deeply depositing fine PM2.5 in pediatric alveoli.",
                "smog_avoidance_tip": "If outdoor transit is unavoidable, sanitize hands and wash faces/nasal passages upon returning home.",
                "exposure_reduction": "90% avoidance of acute deep-lung soot deposition",
                "co2_saved": "N/A (Direct Health Guardian)"
            },
            {
                "time_window": "07:00 - 09:30 PM",
                "activity": "Family Dinner & Indoor Environment",
                "low_emission_action": "Cook with induction or electric stove; always turn on the kitchen exhaust hood. Avoid indoor candle burning, incense, or biomass cookstoves.",
                "impact_explanation": "Gas and biomass cooking generate indoor NO2 and ultrafine particles comparable to active roadway levels.",
                "smog_avoidance_tip": "Wet-mop living areas with a microfiber cloth rather than sweeping with a dry broom.",
                "exposure_reduction": "50% lower indoor PM2.5 and zero secondary VOC smoke",
                "co2_saved": "1.2 kg CO2e / dinner"
            }
        ]
    elif lifestyle_key == "remote_worker":
        steps = [
            {
                "time_window": "07:00 - 09:00 AM",
                "activity": "Morning Awakening & Home Office Setup",
                "low_emission_action": "Zero commute emissions. Keep windows shut against early morning smog draft. Use draft snakes under external doors.",
                "impact_explanation": "Eliminates ~100% of daily transportation footprint (~5 kg CO2e / day).",
                "smog_avoidance_tip": "Do not open windows for 'fresh air' early morning; winter inversions make outdoor air dirtier than unventilated rooms.",
                "exposure_reduction": "85% lower exposure compared to road travelers",
                "co2_saved": "5.2 kg CO2e / day"
            },
            {
                "time_window": "12:00 - 02:00 PM",
                "activity": "Midday Air Flush & Exercise",
                "low_emission_action": "If US AQI is below 150, perform a brief 15-minute cross-ventilation flush between 1:00 PM and 2:30 PM when solar warming lifts the inversion layer.",
                "impact_explanation": "Replenishes indoor oxygen and vents accumulated CO2 without requiring energy-intensive HVAC cycling.",
                "smog_avoidance_tip": "Run indoor HEPA purifiers immediately after closing windows to rapidly scrub residual particles.",
                "exposure_reduction": "Vents stale indoor CO2 while scrubbing particulate matter",
                "co2_saved": "1.1 kWh electrical savings"
            },
            {
                "time_window": "06:00 - 09:00 PM",
                "activity": "Evening Leisure & Energy Management",
                "low_emission_action": "Zone-heat only the room you are currently occupying. Layer warm woolens and thermal socks instead of running high-wattage space heaters throughout the home.",
                "impact_explanation": "Zone heating saves 40–60% of home winter heating energy.",
                "smog_avoidance_tip": "Keep home office and bedroom doors closed to isolate purified clean air zones.",
                "exposure_reduction": "Maintains <15 μg/m³ PM2.5 in living zone",
                "co2_saved": "2.4 kg CO2e / evening"
            }
        ]
    elif lifestyle_key == "senior":
        steps = [
            {
                "time_window": "06:00 - 09:00 AM",
                "activity": "Early Morning Caution",
                "low_emission_action": "Reschedule early morning morning walks to late afternoon or perform gentle stretching/yoga inside a clean-air room.",
                "impact_explanation": "Cold air + peak smog triggers vascular constriction, raising stroke and ischemic heart event risks by 30% in vulnerable seniors.",
                "smog_avoidance_tip": "Never walk outside before sunrise during winter smog episodes.",
                "exposure_reduction": "95% avoidance of peak toxic exposure window",
                "co2_saved": "Zero-emission indoor wellness"
            },
            {
                "time_window": "11:00 - 03:00 PM",
                "activity": "Sunny Midday Window",
                "low_emission_action": "Soak in mild winter sunlight in a closed balcony or sunroom without exposing lungs to chilly direct wind drafts.",
                "impact_explanation": "Natural passive solar heating reduces need for radiant electrical or fossil space heaters.",
                "smog_avoidance_tip": "Keep pulse oximeter and prescribed respiratory inhalers easily accessible.",
                "exposure_reduction": "Comfortable warmth with clean indoor air",
                "co2_saved": "1.8 kg CO2e saved in heating energy"
            },
            {
                "time_window": "06:00 - 09:00 PM",
                "activity": "Night Comfort & Hydration",
                "low_emission_action": "Drink warm herbal infusions and stay hydrated to maintain mucous membrane defense barriers. Use a humidifier if indoor heating drops humidity below 35%.",
                "impact_explanation": "Optimal humidity (40-50%) accelerates gravitational settling of airborne aerosols.",
                "smog_avoidance_tip": "Use ultrasonic humidifier with distilled or boiled water to prevent mineral dust dispersion.",
                "exposure_reduction": "Protects bronchial cilia lining",
                "co2_saved": "N/A (Health Defense)"
            }
        ]
    else:  # General
        steps = [
            {
                "time_window": "07:00 - 09:00 AM",
                "activity": "Morning Awakening & Commute Preparation",
                "low_emission_action": "Avoid outdoor jogging or cycling during the morning inversion peak. Use public transit, bus, or metro.",
                "impact_explanation": "A single metro trip replaces up to 2.5 kg of motor vehicle emissions.",
                "smog_avoidance_tip": "Put on a snug N95 mask before leaving home. Keep windows closed.",
                "exposure_reduction": "80% reduction in inhaled fine dust",
                "co2_saved": "2.5 kg CO2e / commute"
            },
            {
                "time_window": "12:00 - 02:00 PM",
                "activity": "Midday Hours",
                "low_emission_action": "Consolidate errands into a single trip or choose walking/cycling for short neighborhood distances when AQI allows.",
                "impact_explanation": "Cold vehicle engine starts produce 3x more pollutants in the first 5 minutes of driving.",
                "smog_avoidance_tip": "Plan outdoor chores for early afternoon when atmospheric mixing is at its daily maximum.",
                "exposure_reduction": "40% lower particle concentration than morning",
                "co2_saved": "1.2 kg CO2e"
            },
            {
                "time_window": "06:00 - 09:30 PM",
                "activity": "Evening Routine & Home Heating",
                "low_emission_action": "Never burn garden leaves, cardboard, or garbage. Choose clean electric heating or thermal blankets.",
                "impact_explanation": "Open waste burning emits extreme dioxins, black carbon, and carcinogenic benzo[a]pyrene.",
                "smog_avoidance_tip": "Run indoor air filtration on high while cooking and through the evening hours.",
                "exposure_reduction": "Protects household and entire neighborhood air",
                "co2_saved": "4.5 kg CO2e / avoided burn"
            }
        ]

    summary = (
        f"Customized for {lifestyle_label} during current {cat} conditions (US AQI: {aqi_val if aqi_val is not None else 'N/A'}). "
        f"{interp['general_guidance']}"
    )

    return {
        "lifestyle": lifestyle_key,
        "lifestyle_label": lifestyle_label,
        "aqi_severity": sev,
        "aqi_category": cat,
        "summary": summary,
        "morning_inversion_advisory": morning_inversion_advisory,
        "steps": steps
    }


def get_all_indoor_hacks(aqi_val: Optional[int] = None) -> Dict[str, Any]:
    interp = get_aqi_interpretation(aqi_val)
    sev = interp["severity_key"]

    hacks = [
        {
            "id": "corsi-rosenthal-box",
            "title": "DIY Corsi-Rosenthal HEPA Box Filter",
            "category": "Air Filtration",
            "cost_level": "Low-Cost ($20-$35)",
            "difficulty": "Easy",
            "pm25_reduction_pct": "80% - 90% Clean Air Delivery Rate (CADR)",
            "description": "Construct a high-performance air cleaner using a standard 20-inch box fan and four MERV 13 furnace filters taped into a cube.",
            "how_it_works": "The box fan pulls air inwards through a huge surface area of pleated electrostatic MERV 13 media, delivering CADR matching commercial $300 purifiers at a fraction of the cost.",
            "steps": [
                "Acquire 4 MERV-13 pleated HVAC filters (20x20x1 or 20x20x2 inch) and 1 standard 20-inch box fan.",
                "Form the four filters into an open cube with filter air-flow arrows pointing inwards toward the center.",
                "Seal all bottom and side corner seams with heavy-duty duct tape.",
                "Tape a cardboard square as the bottom floor.",
                "Place the fan on top blowing air upwards/outward and tape the perimeter securely."
            ],
            "common_pitfalls": "Pointing filter airflow arrows backwards or leaving unsealed edge leaks where dirty air bypasses the filter."
        },
        {
            "id": "wet-mopping-hygiene",
            "title": "Damp Microfiber Mopping (Never Dry Sweep)",
            "category": "Cleaning & Dust",
            "cost_level": "Zero-Cost",
            "difficulty": "Easy",
            "pm25_reduction_pct": "40% reduction in resuspended indoor particulate matter",
            "description": "Replace traditional dry brooms with damp microfiber flat mops during smog episodes.",
            "how_it_works": "Dry sweeping with a standard broom resuspends settled toxic PM2.5 and PM10 particles into the breathing zone for up to 2 hours. A damp mop traps particles via capillary adhesion.",
            "steps": [
                "Use a damp microfiber mop with plain warm water or mild soap.",
                "Mop from the furthest corner of the room towards the exit door.",
                "Rinse the mop head frequently in clean water.",
                "Avoid vacuum cleaners unless they are certified sealed true-HEPA models."
            ],
            "common_pitfalls": "Using a dry feather duster or dry broom, which launches settling heavy metals and soot back into lung elevation."
        },
        {
            "id": "door-window-draft-proofing",
            "title": "DIY Window & Door Draft Sealing",
            "category": "Infiltration Defense",
            "cost_level": "Low-Cost ($5-$10)",
            "difficulty": "Easy",
            "pm25_reduction_pct": "50% - 60% reduction in outdoor smog infiltration",
            "description": "Seal microscopic air gaps along window frames, balcony sliders, and entrance doors using foam weatherstripping tape and draft snake rolls.",
            "how_it_works": "During cold winter nights, stack-effect pressure forces dense, smog-laden outdoor air through door sills and window gaps. Creating a compression seal stops convective leak paths.",
            "steps": [
                "Inspect windows on a windy evening by holding an incense stick or candle to identify draft leaks.",
                "Apply self-adhesive high-density EPDM foam tape along window meeting rails and sash grooves.",
                "Place a rolled bath towel or fabric draft stopper along the base of main external doors.",
                "Close heavy insulated curtains at sundown to add a secondary thermal and particulate barrier."
            ],
            "common_pitfalls": "Only sealing windows and ignoring the large gap beneath the main entrance door."
        },
        {
            "id": "strategic-ventilation-timing",
            "title": "Solar-Assisted Ventilation Windows",
            "category": "Ventilation Timing",
            "cost_level": "Zero-Cost",
            "difficulty": "Easy",
            "pm25_reduction_pct": "Reduces indoor CO2 without letting in peak morning smog",
            "description": "Time room airing strictly to the brief daily atmospheric inversion-break window between 1:00 PM and 2:30 PM.",
            "how_it_works": "Winter smog is trapped by early morning radiative temperature inversions. Peak sunlight between 1-3 PM expands the mixing layer height, causing surface PM2.5 to drop by 30-60% compared to dawn.",
            "steps": [
                "Keep windows firmly shut between 6:00 AM and 11:30 AM.",
                "Check the AirAware app at 1:00 PM; if AQI has dipped, open opposite windows for a 10-minute rapid flush.",
                "Reseal all windows by 3:30 PM before evening cooling reinstates the ground-level inversion.",
                "Turn the indoor air purifier to maximum fan speed for 15 minutes after sealing."
            ],
            "common_pitfalls": "Opening windows at 7:00 AM believing morning air is freshest — this is the dirtiest hour of the winter day."
        },
        {
            "id": "clean-cooking-exhaust-protocol",
            "title": "Two-Stage Cooking Exhaust Protocol",
            "category": "Cooking & Combustion",
            "cost_level": "Zero-Cost",
            "difficulty": "Easy",
            "pm25_reduction_pct": "70% reduction in cooking-generated PM2.5 and acrolein",
            "description": "Establish proper kitchen ventilation habits during frying, tadka, and high-heat cooking.",
            "how_it_works": "Deep frying and gas combustion produce internal PM2.5 spikes exceeding 400 μg/m³. Operating exhaust hoods properly vents emissions before they migrate to bedrooms.",
            "steps": [
                "Switch on the kitchen range hood / exhaust fan 1 minute before lighting the stove.",
                "Close interior kitchen doors so cooking fumes cannot flow into bedrooms or living rooms.",
                "Leave the kitchen window cracked slightly to provide make-up air for the exhaust fan.",
                "Keep exhaust running for 5 minutes after cooking finishes."
            ],
            "common_pitfalls": "Opening the kitchen door to the living room while running the exhaust fan, pulling living room air and circulating cooking soot throughout the house."
        },
        {
            "id": "air-purifying-plants-reality",
            "title": "Houseplants: Real Benefits vs Smog Limitations",
            "category": "Indoor Environment",
            "cost_level": "Low-Cost",
            "difficulty": "Easy",
            "pm25_reduction_pct": "Aesthetic & humidity benefit; minimal particulate filtering",
            "description": "Understand what indoor plants (Snake Plant, Areca Palm, Spider Plant) can and cannot do during winter smog.",
            "how_it_works": "While NASA clean-air studies showed plants absorb volatile organic compounds (VOCs) in sealed chambers, they cannot capture microscopic particulate soot (PM2.5). However, they help balance indoor humidity.",
            "steps": [
                "Wipe dust and particulate build-up off broad houseplant leaves with a wet cloth weekly.",
                "Do not rely on houseplants as a substitute for mechanical HEPA air filtration.",
                "Use plants to maintain 40–50% indoor relative humidity, which helps airborne dust settle out of breathing zones."
            ],
            "common_pitfalls": "Assuming a few potted plants will clean heavy winter smog without needing a mechanical HEPA filter."
        }
    ]

    golden_rules = [
        "Rule 1: Never dry sweep or vacuum without a sealed HEPA exhaust filter.",
        "Rule 2: Seal morning air drafts — winter morning air is the most toxic of the day.",
        "Rule 3: Establish a single designated 'Clean Air Sanctuary Room' with HEPA filtration if whole-home purifying isn't feasible.",
        "Rule 4: Zero indoor combustion — eliminate incense, scented candles, and indoor smoking completely.",
        "Rule 5: Keep humidity between 40% and 50% to prevent respiratory mucosa drying."
    ]

    return {
        "current_aqi_severity": sev,
        "total_hacks": len(hacks),
        "hacks": hacks,
        "golden_rules": golden_rules
    }


def get_sustainable_alternatives_catalog() -> Dict[str, Any]:
    alternatives = [
        {
            "id": "transit-metro-vs-solo-car",
            "domain": "Commute & Transit",
            "conventional_practice": "Single-Occupancy Petrol/Diesel Car Commute (15 km one-way)",
            "sustainable_swap": "Electric Metro / Dedicated Bus Rapid Transit (BRT) + E-Rickshaw First/Last Mile",
            "emissions_impact": "Saves ~5.2 kg CO2e and 9g PM2.5 per round trip",
            "health_benefit": "Reduces commuter toxic volatile organic compound (VOC) exposure by 65%",
            "ease_of_adoption": "High in metropolitan transit corridors",
            "direct_impact_explanation": "One commuter switching to public electric rail saves over 1.2 metric tons of carbon dioxide and prevents enough soot emissions to clear 25,000 m³ of city air every winter.",
            "annual_co2_saving_kg": 1240.0,
            "pm25_reduction_score": "High"
        },
        {
            "id": "heating-heatpump-vs-biomass",
            "domain": "Heating & Winter Comfort",
            "conventional_practice": "Burning Firewood, Coal, or Kerosene for Night Space Heating",
            "sustainable_swap": "Energy-Star Inverter Heat Pump / Mica-Thermic Radiant Electric Heaters + Thermal Undergarments",
            "emissions_impact": "100% elimination of indoor carbon monoxide, black carbon, and particulate soot",
            "health_benefit": "Eliminates dangerous indoor carbon monoxide poisoning risk and nighttime bronchospasms",
            "ease_of_adoption": "Moderate (requires upfront electrical appliance upgrade)",
            "direct_impact_explanation": "Burning 5 kg of wood per night releases over 80 grams of PM2.5 and carcinogenic polycyclic aromatic hydrocarbons directly into ground-level breathing air.",
            "annual_co2_saving_kg": 850.0,
            "pm25_reduction_score": "Extreme"
        },
        {
            "id": "waste-compost-vs-open-burning",
            "domain": "Waste & Crop Management",
            "conventional_practice": "Open Burning of Dry Leaves, Yard Waste, and Household Garbage",
            "sustainable_swap": "Aerobic Community Composting & Microbial Bio-Enzyme In-Situ Decomposition",
            "emissions_impact": "Prevents 100% of open smoke, black carbon, and toxic dioxin plumes",
            "health_benefit": "Eliminates acute eye burning and wheezing episodes for entire residential blocks",
            "ease_of_adoption": "High with community participation",
            "direct_impact_explanation": "Open leaf and waste burning is the leading localized trigger for severe evening smog spikes in residential neighborhoods. Composting turns waste into nutrient-rich soil humus.",
            "annual_co2_saving_kg": 420.0,
            "pm25_reduction_score": "Extreme"
        },
        {
            "id": "cooking-induction-vs-unvented-gas",
            "domain": "Cooking & Indoor Energy",
            "conventional_practice": "Cooking with Unvented LPG / Solid Fuel without Extraction Hood",
            "sustainable_swap": "Magnetic Induction Cooktops powered by Grid/Solar Electricity + Dedicated High-CFM Range Hood",
            "emissions_impact": "Saves ~300 kg CO2e/year and prevents indoor nitrogen dioxide (NO2) spikes",
            "health_benefit": "Decreases childhood asthma incidence by 34% by eliminating indoor combustion gases",
            "ease_of_adoption": "High (inexpensive plug-and-play induction cookers)",
            "direct_impact_explanation": "Induction transfers 85-90% of energy directly to cookware (vs 40% for gas burners), keeping kitchens cooler, cleaner, and free of combustive carbon monoxide.",
            "annual_co2_saving_kg": 320.0,
            "pm25_reduction_score": "Moderate to High"
        },
        {
            "id": "construction-dust-suppression",
            "domain": "Community & Neighborhood",
            "conventional_practice": "Uncovered Construction Sand, Cement Bags, and Dry Demolition",
            "sustainable_swap": "Green Tarpaulin Screening, Anti-Smog Water Misting, and Geotextile Topsoil Cover",
            "emissions_impact": "Suppresses up to 85% of fugitive airborne PM10 and PM2.5 dust",
            "health_benefit": "Prevents silicosis risk and chronic cough for nearby neighbors and workers",
            "ease_of_adoption": "Standard civic compliance requirement",
            "direct_impact_explanation": "Fugitive construction dust represents up to 20-30% of coarse winter air pollution in fast-growing cities. Water misting causes fine dust to aggregate and drop to ground level.",
            "annual_co2_saving_kg": 150.0,
            "pm25_reduction_score": "High"
        }
    ]

    domains = list({item["domain"] for item in alternatives})

    return {
        "total": len(alternatives),
        "domains": domains,
        "alternatives": alternatives
    }


def calculate_user_impact(
    daily_commute_km: float,
    primary_commute_mode: str,
    heating_source: str,
    heating_hours_per_day: float,
    uses_n95_mask: bool,
    uses_indoor_hepa: bool,
    avoids_outdoor_exercise_peaks: bool
) -> Dict[str, Any]:
    """
    Calculates quantified weekly emissions, savings vs worst-case baseline,
    and personal lung exposure reduction.
    """
    # Emission Factors (CO2 kg/km and PM2.5 g/km)
    commute_factors = {
        "car_petrol": {"co2_per_km": 0.170, "pm25_per_km": 0.035, "label": "Petrol Car (Solo)"},
        "car_diesel": {"co2_per_km": 0.195, "pm25_per_km": 0.080, "label": "Diesel Car (Solo)"},
        "motorbike": {"co2_per_km": 0.075, "pm25_per_km": 0.040, "label": "Motorcycle / Scooter"},
        "bus": {"co2_per_km": 0.040, "pm25_per_km": 0.012, "label": "Public Bus (Average)"},
        "metro": {"co2_per_km": 0.015, "pm25_per_km": 0.001, "label": "Electric Metro / Rail"},
        "bicycle_walk": {"co2_per_km": 0.000, "pm25_per_km": 0.000, "label": "Bicycle / Walking"},
        "work_from_home": {"co2_per_km": 0.000, "pm25_per_km": 0.000, "label": "Work From Home"}
    }

    # Heating Factors (CO2 kg/hour and PM2.5 g/hour)
    heating_factors = {
        "biomass_wood": {"co2_per_hr": 2.20, "pm25_per_hr": 16.0, "label": "Wood / Charcoal Fire"},
        "kerosene": {"co2_per_hr": 1.85, "pm25_per_hr": 5.5, "label": "Kerosene Space Heater"},
        "coal": {"co2_per_hr": 2.60, "pm25_per_hr": 22.0, "label": "Coal Briquettes / Angithi"},
        "electric_heater": {"co2_per_hr": 0.95, "pm25_per_hr": 0.1, "label": "Electric Radiant/Oil Heater"},
        "heat_pump": {"co2_per_hr": 0.35, "pm25_per_hr": 0.0, "label": "5-Star Heat Pump"},
        "thermal_clothing_only": {"co2_per_hr": 0.00, "pm25_per_hr": 0.0, "label": "Thermal Clothing / Quilts"}
    }

    commute_mode = primary_commute_mode if primary_commute_mode in commute_factors else "car_petrol"
    heat_mode = heating_source if heating_source in heating_factors else "electric_heater"

    c_factor = commute_factors[commute_mode]
    h_factor = heating_factors[heat_mode]

    # Weekly calculations (5 commute days, 7 heating days)
    commute_weekly_km = daily_commute_km * 5
    commute_co2 = commute_weekly_km * c_factor["co2_per_km"]
    commute_pm25 = commute_weekly_km * c_factor["pm25_per_km"]

    heat_weekly_hrs = heating_hours_per_day * 7
    heat_co2 = heat_weekly_hrs * h_factor["co2_per_hr"]
    heat_pm25 = heat_weekly_hrs * h_factor["pm25_per_hr"]

    total_co2 = round(commute_co2 + heat_co2, 2)
    total_pm25 = round(commute_pm25 + heat_pm25, 2)

    # Worst-case baseline comparison: Solo diesel car + Wood/coal heating
    worst_commute_co2 = commute_weekly_km * commute_factors["car_diesel"]["co2_per_km"]
    worst_commute_pm25 = commute_weekly_km * commute_factors["car_diesel"]["pm25_per_km"]
    worst_heat_co2 = heat_weekly_hrs * heating_factors["biomass_wood"]["co2_per_hr"]
    worst_heat_pm25 = heat_weekly_hrs * heating_factors["biomass_wood"]["pm25_per_hr"]

    baseline_co2 = worst_commute_co2 + worst_heat_co2
    baseline_pm25 = worst_commute_pm25 + worst_heat_pm25

    co2_savings = max(0.0, round(baseline_co2 - total_co2, 2))
    pm25_prevented = max(0.0, round(baseline_pm25 - total_pm25, 2))

    # Personal Exposure Reduction Calculation
    # Outdoor baseline exposure assumed ~ 100%
    exposure_penalty = 100.0
    if uses_n95_mask:
        exposure_penalty *= 0.35  # N95 filters 95%+ of PM2.5 when worn
    if uses_indoor_hepa:
        exposure_penalty *= 0.40  # Indoor HEPA keeps indoor PM2.5 low
    if avoids_outdoor_exercise_peaks:
        exposure_penalty *= 0.70  # Avoiding morning peak exercise avoids 30% of daily lung burden

    personal_reduction_pct = round(100.0 - exposure_penalty, 1)

    # Clean Air Stewardship Score (0-100)
    score = 50
    if commute_mode in ("metro", "bicycle_walk", "work_from_home"):
        score += 20
    elif commute_mode == "bus":
        score += 10
    elif commute_mode in ("car_diesel", "car_petrol"):
        score -= 10

    if heat_mode in ("thermal_clothing_only", "heat_pump"):
        score += 15
    elif heat_mode == "electric_heater":
        score += 5
    elif heat_mode in ("biomass_wood", "coal"):
        score -= 25

    if uses_n95_mask:
        score += 5
    if uses_indoor_hepa:
        score += 5
    if avoids_outdoor_exercise_peaks:
        score += 5

    clean_air_score = max(5, min(100, score))

    if clean_air_score >= 85:
        stewardship_level = "Clean Air Champion (Outstanding)"
        impact_narrative = (
            f"You are actively protecting both community air quality and your personal respiratory health. "
            f"Your lifestyle choices prevent approximately {co2_savings} kg of CO2e and {pm25_prevented} grams "
            f"of fine soot emissions every single week compared to conventional high-emission urban habits."
        )
    elif clean_air_score >= 65:
        stewardship_level = "Proactive Smog Mitigator (Good)"
        impact_narrative = (
            f"You have adopted strong clean air habits that prevent {co2_savings} kg of CO2e weekly. "
            f"Adopting public transit or upgrading home heating insulation can elevate you to top-tier stewardship."
        )
    else:
        stewardship_level = "Opportunity for Impact (Needs Action)"
        impact_narrative = (
            f"Your current daily choices produce significant localized combustion emissions. "
            f"By switching heating sources and utilizing shared or public transit, you could prevent over "
            f"{co2_savings} kg of carbon emissions and dramatically reduce your family's PM2.5 exposure."
        )

    # Actionable upgrades
    upgrades = []
    if commute_mode in ("car_petrol", "car_diesel"):
        upgrades.append("Switch to Metro or carpool on high AQI alert days to cut transit emissions by 75%.")
    if heat_mode in ("biomass_wood", "coal", "kerosene"):
        upgrades.append("Replace open biomass/coal combustion with radiant electric heat to eliminate deadly carbon monoxide and soot.")
    if not uses_indoor_hepa:
        upgrades.append("Build a DIY Corsi-Rosenthal box filter or use a HEPA purifier to reduce indoor fine particulate by 80%.")
    if not uses_n95_mask:
        upgrades.append("Equip yourself and family members with certified N95 masks for outdoor commutes on smoggy days.")
    if not avoids_outdoor_exercise_peaks:
        upgrades.append("Shift morning outdoor cardio to afternoons or indoors to avoid peak ground inversion pollution.")

    if not upgrades:
        upgrades.append("Maintain your exemplary clean air routine and inspire neighbors with community awareness!")

    # Mode comparison breakdown
    comparison = [
        {
            "mode": "current_selection",
            "mode_label": f"Your Mode ({c_factor['label']})",
            "weekly_co2_kg": round(commute_co2, 2),
            "weekly_pm25_grams": round(commute_pm25, 2)
        },
        {
            "mode": "metro",
            "mode_label": "Electric Metro Rail",
            "weekly_co2_kg": round(commute_weekly_km * commute_factors["metro"]["co2_per_km"], 2),
            "weekly_pm25_grams": round(commute_weekly_km * commute_factors["metro"]["pm25_per_km"], 2)
        },
        {
            "mode": "bus",
            "mode_label": "Public Bus Transit",
            "weekly_co2_kg": round(commute_weekly_km * commute_factors["bus"]["co2_per_km"], 2),
            "weekly_pm25_grams": round(commute_weekly_km * commute_factors["bus"]["pm25_per_km"], 2)
        },
        {
            "mode": "car_petrol",
            "mode_label": "Solo Petrol Car",
            "weekly_co2_kg": round(commute_weekly_km * commute_factors["car_petrol"]["co2_per_km"], 2),
            "weekly_pm25_grams": round(commute_weekly_km * commute_factors["car_petrol"]["pm25_per_km"], 2)
        }
    ]

    return {
        "weekly_co2_emissions_kg": total_co2,
        "weekly_co2_savings_vs_baseline_kg": co2_savings,
        "weekly_pm25_emitted_grams": total_pm25,
        "weekly_pm25_prevented_grams": pm25_prevented,
        "personal_exposure_reduction_pct": personal_reduction_pct,
        "estimated_clean_air_score": clean_air_score,
        "stewardship_level": stewardship_level,
        "impact_narrative": impact_narrative,
        "actionable_upgrades": upgrades,
        "comparison_breakdown": comparison
    }
