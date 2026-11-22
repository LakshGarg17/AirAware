import React from 'react';
import { 
  CalendarCheck, RotateCcw, Check, Sparkles, Clock, 
  ArrowRight, ShieldCheck, CheckCircle2, Circle, PlusCircle 
} from 'lucide-react';
import { usePlan } from '../hooks/usePlan';
import { getSeverityStyle } from '../utils/severity';

const PERIOD_CONFIG = {
  morning: { label: "Morning Routine", time: "06:00 - 10:00 AM", icon: "🌅", desc: "Peak thermal inversion window; prioritize barrier sealing and transit exposure reduction." },
  afternoon: { label: "Midday Window", time: "11:00 AM - 03:00 PM", icon: "☀️", desc: "Solar mixing layer expansion; optimal window for short errands and air renewal." },
  evening: { label: "Evening Return", time: "05:00 - 09:00 PM", icon: "🌆", desc: "Congestion and secondary inversion descent; focus on kitchen ventilation and off-peak travel." },
  night: { label: "Overnight Comfort", time: "09:00 PM - Dawn", icon: "🌙", desc: "Sleep sanctuary protection; wet cleaning and clean radiant heating." }
};

export default function DailyPlanPage({ latitude, longitude, profile, onQuickLogImpact }) {
  const {
    planData,
    isLoading,
    error,
    completedIds,
    toggleAction,
    regenerate,
    completedCount,
    totalActions,
    todayStr
  } = usePlan(latitude, longitude, profile);

  const aqiContext = planData?.aqi_context;
  const severityStyle = getSeverityStyle(aqiContext?.severity_key);
  const progressPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Personalized Daily Timeline
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Daily Smog Navigation Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tailored to your lifestyle and current atmospheric inversion cycles. <span className="italic">Optional — do what fits your day.</span>
        </p>
      </div>

      {/* AQI Context Strip & Progress Card */}
      {aqiContext && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left AQI info */}
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-2xl text-center shadow-xs ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-90">US AQI</span>
              <span className="text-2xl font-black">{aqiContext.aqi ?? 'N/A'}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm">{aqiContext.category}</span>
                <span className="text-xs text-slate-400">· {aqiContext.location}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{planData?.based_on}</p>
            </div>
          </div>

          {/* Right: Progress & Regenerate */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[180px]">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Actions Completed</span>
                <span className="text-sky-600">{completedCount} of {totalActions}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-600 transition-all duration-300" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <button
              onClick={regenerate}
              title="Regenerate alternative equivalent actions"
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs">
          Unable to update daily plan: {error}
        </div>
      )}

      {/* 4 Periods Timeline */}
      {planData?.periods && (
        <div className="space-y-6">
          {Object.entries(PERIOD_CONFIG).map(([periodKey, cfg]) => {
            const items = planData.periods[periodKey] || [];
            return (
              <div 
                key={periodKey}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                {/* Period Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{cfg.icon}</span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {cfg.label}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {cfg.time} · {cfg.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {items.filter(it => completedIds.includes(it.id)).length}/{items.length} done
                  </span>
                </div>

                {/* Items in period */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item) => {
                    const isChecked = completedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isChecked
                            ? 'bg-sky-50/50 border-sky-200 text-slate-500'
                            : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <button
                              onClick={() => toggleAction(item.id)}
                              className="flex items-center space-x-2.5 text-left group"
                            >
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-sky-600 border-sky-600 text-white'
                                  : 'border-slate-300 bg-white group-hover:border-sky-500'
                              }`}>
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {item.title}
                              </span>
                            </button>

                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                              {item.category}
                            </span>
                          </div>

                          <p className={`text-xs leading-relaxed ml-7 ${isChecked ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.description}
                          </p>

                          <p className="text-[11px] text-slate-400 italic ml-7 mt-1.5">
                            💡 {item.reason}
                          </p>
                        </div>

                        {/* Optional Log to Impact button if completed and action type available */}
                        {isChecked && item.impact_type && (
                          <div className="ml-7 mt-3 pt-2 border-t border-sky-100 flex items-center justify-between text-[11px]">
                            <span className="text-teal-700 font-semibold">Completed!</span>
                            <button
                              onClick={() => onQuickLogImpact && onQuickLogImpact(item.impact_type)}
                              className="text-sky-700 hover:text-sky-900 font-bold flex items-center space-x-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Log to Impact Tracker</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
