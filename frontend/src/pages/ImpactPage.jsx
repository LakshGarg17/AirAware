import React, { useState } from 'react';
import { 
  Calculator, Sparkles, TrendingDown, Shield, Check, 
  ArrowUpRight, Award, Loader2 
} from 'lucide-react';
import { calculatePersonalImpact } from '../api/client';

export default function ImpactPage() {
  const [commuteKm, setCommuteKm] = useState(15);
  const [commuteMode, setCommuteMode] = useState('car_petrol');
  const [heatingSource, setHeatingSource] = useState('electric_heater');
  const [heatingHours, setHeatingHours] = useState(4);
  const [usesN95, setUsesN95] = useState(true);
  const [usesHepa, setUsesHepa] = useState(true);
  const [avoidsPeaks, setAvoidsPeaks] = useState(true);

  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    try {
      const data = await calculatePersonalImpact({
        daily_commute_km: Number(commuteKm),
        primary_commute_mode: commuteMode,
        heating_source: heatingSource,
        heating_hours_per_day: Number(heatingHours),
        uses_n95_mask_on_smog_days: usesN95,
        uses_indoor_hepa_filter: usesHepa,
        avoids_outdoor_exercise_peaks: avoidsPeaks
      });
      setResult(data);
    } catch (err) {
      console.error('Impact calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Initial calculation on mount
  React.useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Personal Footprint & Exposure Calculator
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Clean Air Stewardship Calculator
        </h1>
        <p className="text-sm text-slate-600">
          Quantify your weekly carbon avoidance, soot reduction, and personal lung exposure savings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Left: Input Form Controls */}
        <form onSubmit={handleCalculate} className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Daily Lifestyle Inputs</span>
          </h3>

          {/* Commute Distance */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Daily Commute (Round Trip):</span>
              <span className="text-indigo-600 font-bold">{commuteKm} km</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={commuteKm}
              onChange={(e) => setCommuteKm(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Commute Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Transit Mode:
            </label>
            <select
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="car_petrol">Solo Petrol Car (170g CO2/km)</option>
              <option value="car_diesel">Solo Diesel Car (195g CO2/km, High Soot)</option>
              <option value="motorbike">Motorcycle / Scooter (75g CO2/km)</option>
              <option value="bus">Public Bus Transit (40g CO2/km)</option>
              <option value="metro">Electric Metro Rail (15g CO2/km)</option>
              <option value="bicycle_walk">Bicycle / Walking (Zero Emissions)</option>
              <option value="work_from_home">Work From Home (Zero Commute)</option>
            </select>
          </div>

          {/* Winter Heating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Winter Room Heating Method:
            </label>
            <select
              value={heatingSource}
              onChange={(e) => setHeatingSource(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="electric_heater">Electric Radiant / Oil Heater</option>
              <option value="heat_pump">5-Star Inverter Heat Pump</option>
              <option value="thermal_clothing_only">Thermal Innerwear & Quilts Only</option>
              <option value="biomass_wood">Wood / Charcoal Fire (High Indoor PM2.5)</option>
              <option value="coal">Coal Angithi / Briquettes (Dangerous CO & Soot)</option>
              <option value="kerosene">Kerosene Space Heater</option>
            </select>
          </div>

          {/* Heating Hours */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Heating Runtime per Day:</span>
              <span className="text-indigo-600 font-bold">{heatingHours} hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={heatingHours}
              onChange={(e) => setHeatingHours(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Protective Habits Checkboxes */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Personal Exposure Safeguards:
            </span>

            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={usesN95}
                onChange={(e) => setUsesN95(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>I wear a fitted N95 respirator during outdoor commutes</span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={usesHepa}
                onChange={(e) => setUsesHepa(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>I run an indoor HEPA purifier / DIY Corsi box filter</span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidsPeaks}
                onChange={(e) => setAvoidsPeaks(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>I avoid morning outdoor cardio (6 AM - 10 AM inversion peak)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isCalculating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {isCalculating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            <span>Calculate Direct Impact</span>
          </button>
        </form>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Score Card */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                      Clean Air Stewardship Score
                    </span>
                    <div className="flex items-baseline space-x-2 my-1">
                      <span className="text-5xl font-black text-white">{result.estimated_clean_air_score}</span>
                      <span className="text-indigo-300 text-lg font-semibold">/ 100</span>
                    </div>
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      {result.stewardship_level}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center sm:text-right">
                    <span className="block text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">
                      Lung Exposure Reduction
                    </span>
                    <span className="text-3xl font-black text-teal-400">
                      {result.personal_exposure_reduction_pct}%
                    </span>
                    <span className="block text-[10px] text-indigo-300 mt-0.5">
                      Avoided particulate inhalation
                    </span>
                  </div>
                </div>

                <p className="mt-6 pt-4 border-t border-indigo-800/60 text-xs text-indigo-100 leading-relaxed">
                  {result.impact_narrative}
                </p>
              </div>

              {/* Quantified Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Weekly CO2 Footprint</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {result.weekly_co2_emissions_kg} <span className="text-xs font-normal text-slate-400">kg</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Weekly CO2 Saved</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    {result.weekly_co2_savings_vs_baseline_kg} <span className="text-xs font-normal text-slate-400">kg</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Weekly PM2.5 Emitted</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {result.weekly_pm25_emitted_grams} <span className="text-xs font-normal text-slate-400">g</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">PM2.5 Prevented</span>
                  <span className="text-xl font-black text-teal-600 mt-1 block">
                    {result.weekly_pm25_prevented_grams} <span className="text-xs font-normal text-slate-400">g</span>
                  </span>
                </div>
              </div>

              {/* Transit Mode Comparison Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-4">
                  Comparative Transit Modes (Weekly Impact for {commuteKm * 5} km)
                </h4>
                <div className="space-y-3">
                  {result.comparison_breakdown?.map((m) => (
                    <div 
                      key={m.mode} 
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        m.mode === 'current_selection'
                          ? 'bg-indigo-50/70 border-indigo-200 font-bold'
                          : 'bg-slate-50 border-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-slate-800">{m.mode_label}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-600">{m.weekly_co2_kg} kg CO2</span>
                        <span className="text-teal-700 font-bold">{m.weekly_pm25_grams} g PM2.5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Upgrades */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>High-Leverage Personal Upgrades</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {result.actionable_upgrades?.map((upg, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{upg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
