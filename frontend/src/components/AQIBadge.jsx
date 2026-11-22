import React from 'react';
import { Shield, AlertTriangle, Wind, Info, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { getSeverityStyle } from '../utils/severity';

export default function AQIBadge({ aqiData }) {
  const currentAqi = aqiData?.current_aqi;
  const europeanAqi = aqiData?.european_aqi;
  const style = getSeverityStyle(currentAqi?.severity_key);

  const aqiVal = currentAqi?.aqi;
  const isAvailable = aqiVal !== null && aqiVal !== undefined;

  return (
    <div className={`rounded-3xl border ${style.cardBg} p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden`}>
      {/* Decorative background glow */}
      <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${style.badgeBg}`} />

      <div className="relative z-10">
        {/* Top bar: Standard Label & European AQI Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm border border-slate-200/80">
              <span className={`w-2 h-2 rounded-full ${style.indicatorDot} animate-pulse`} />
              <span>US AQI Standard</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              (US Environmental Protection Agency Breakpoints)
            </span>
          </div>

          {europeanAqi && europeanAqi.value !== null && (
            <div className="text-xs font-medium text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200/70">
              <span>European AQI: </span>
              <strong className="text-slate-900">{europeanAqi.value} {europeanAqi.unit || 'EAQI'}</strong>
            </div>
          )}
        </div>

        {/* Center: Massive AQI Value + Category Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-baseline sm:items-center space-y-2 sm:space-y-0 sm:space-x-5">
            <div className="flex items-baseline">
              <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900">
                {isAvailable ? aqiVal : 'N/A'}
              </span>
              <span className="ml-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                US AQI
              </span>
            </div>

            <div className="flex flex-col">
              <span className={`inline-block px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wide shadow-sm ${style.badgeBg} ${style.badgeText}`}>
                {currentAqi?.category || 'Unavailable'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 font-medium">
                Real-time aggregate index
              </span>
            </div>
          </div>

          {/* Right: General Guidance Narrative */}
          <div className="lg:col-span-7 bg-white/85 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-start space-x-3">
              <Info className={`w-5 h-5 shrink-0 mt-0.5 ${style.textClass}`} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Health & Smog Advisory
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentAqi?.general_guidance || 'Air quality data is currently being retrieved.'}
                </p>
                {currentAqi?.sensitive_groups_guidance && (
                  <p className="mt-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <strong className="text-slate-800">Sensitive Groups: </strong>
                    {currentAqi.sensitive_groups_guidance}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Safeguard Chips */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Outdoor Mask</span>
              <span className="text-xs font-bold text-slate-800">
                {currentAqi?.mask_recommendation || 'N95 recommended if hazy'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Outdoor Workout</span>
              <span className="text-xs font-bold text-slate-800">
                {currentAqi?.outdoor_activity_recommendation || 'Proceed with caution'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Indoor Defense</span>
              <span className="text-xs font-bold text-slate-800">
                {currentAqi?.indoor_guidance || 'Keep windows closed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
