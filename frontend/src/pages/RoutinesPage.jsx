import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Baby, Home, HeartPulse, Clock, 
  ShieldCheck, Leaf, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import { fetchDailyRoutines } from '../api/client';
import { getSeverityStyle } from '../utils/severity';

const LIFESTYLES = [
  { id: 'general', label: 'General Resident', icon: Users, desc: 'Balanced community smog routine' },
  { id: 'commuter', label: 'Daily Commuter', icon: Briefcase, desc: 'Transit & office exposure protection' },
  { id: 'family_kids', label: 'Family with Kids', icon: Baby, desc: 'School, playground & pediatric defense' },
  { id: 'remote_worker', label: 'Remote Worker', icon: Home, desc: 'Home office indoor air & energy savings' },
  { id: 'senior', label: 'Senior & Sensitive', icon: HeartPulse, desc: 'Vascular & respiratory safeguards' },
];

export default function RoutinesPage({ currentAqiData }) {
  const [selectedLifestyle, setSelectedLifestyle] = useState('commuter');
  const [routineData, setRoutineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const aqiVal = currentAqiData?.current_aqi?.aqi;
  const severityKey = currentAqiData?.current_aqi?.severity_key;
  const severityStyle = getSeverityStyle(severityKey);

  useEffect(() => {
    let isMounted = true;
    async function loadRoutines() {
      setIsLoading(true);
      try {
        const data = await fetchDailyRoutines(aqiVal, selectedLifestyle);
        if (isMounted) setRoutineData(data);
      } catch (err) {
        console.error('Failed to load routines:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRoutines();
    return () => { isMounted = false; };
  }, [aqiVal, selectedLifestyle]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Lifestyle-Tailored Smog Navigation
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Low-Emission Daily Routines
        </h1>
        <p className="text-sm text-slate-600">
          Timing your day to avoid peak ground-level atmospheric inversions while shrinking your personal emissions footprint.
        </p>
      </div>

      {/* Lifestyle Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
        {LIFESTYLES.map((ls) => {
          const Icon = ls.icon;
          const isSelected = selectedLifestyle === ls.id;
          return (
            <button
              key={ls.id}
              onClick={() => setSelectedLifestyle(ls.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                <span className="font-bold text-xs sm:text-sm">{ls.label}</span>
              </div>
              <p className={`text-[11px] leading-tight ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                {ls.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Routine Content Box */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Tailoring low-emission schedule...</p>
        </div>
      ) : routineData ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Summary Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
                  US AQI: {aqiVal !== null && aqiVal !== undefined ? aqiVal : 'N/A'} ({routineData.aqi_category})
                </span>
                <span className="text-xs text-slate-500 font-medium">Profile: {routineData.lifestyle_label}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                {routineData.summary}
              </p>
            </div>
          </div>

          {/* Morning Thermal Inversion Callout */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-amber-950 flex items-start space-x-3 text-xs leading-relaxed">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 block font-semibold mb-0.5">Atmospheric Inversion Advisory:</strong>
              {routineData.morning_inversion_advisory}
            </div>
          </div>

          {/* Chronological Steps Timeline */}
          <div className="space-y-4">
            {routineData.steps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
              >
                {/* Time & Activity */}
                <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md mb-1.5">
                    {step.time_window}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {step.activity}
                  </h4>
                </div>

                {/* Low-Emission Action & Direct Impact */}
                <div className="md:col-span-5 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Low-Emission Choice
                    </span>
                    <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                      {step.low_emission_action}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                    💡 <strong>Direct Impact:</strong> {step.impact_explanation}
                  </p>
                </div>

                {/* Smog Avoidance & Impact Metrics */}
                <div className="md:col-span-4 bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Smog Protection Tip
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {step.smog_avoidance_tip}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-teal-700 font-semibold">{step.co2_saved}</span>
                    <span className="text-sky-700 font-semibold">{step.exposure_reduction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
