import React, { useState } from 'react';
import { 
  AlertCircle, Clock, ArrowRight, UserCheck, 
  Sparkles, CalendarCheck, Home, Leaf, BarChart3, X 
} from 'lucide-react';
import LocationSearch from '../components/LocationSearch';
import AQIBadge from '../components/AQIBadge';
import WeatherWidget from '../components/WeatherWidget';
import PollutantGrid from '../components/PollutantGrid';
import AQITrendChart from '../components/AQITrendChart';

export default function DashboardPage({ 
  aqiData, 
  currentLocation, 
  onLocationSelect, 
  isLoading, 
  error,
  onNavigateTab,
  onOpenProfile,
  profile
}) {
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner / Location Search Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Navigate Winter Smog with <span className="text-sky-600">Actionable Clarity</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Real-time US AQI standard, atmospheric inversion forecasts, personalized routines, and verified impact tracking.
        </p>
        <div className="pt-2">
          <LocationSearch 
            onLocationSelect={onLocationSelect} 
            currentLocation={currentLocation}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Dismissible First-Run / Personalization Banner */}
      {!profileBannerDismissed && (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-teal-50 border border-sky-200/80 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Personalize Your Smog Navigation Plan
              </h4>
              <p className="text-xs text-slate-500">
                Tailor advice to your daily commute, exercise habits, and household members in 30 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Set Profile
            </button>
            <button
              onClick={() => setProfileBannerDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <strong>Unable to refresh air data:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && !aqiData && (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-medium text-xs">Retrieving atmospheric observations from Open-Meteo...</p>
        </div>
      )}

      {/* Main Dashboard Layout */}
      {aqiData && (
        <div className="space-y-8">
          {/* Main Hero: AQI Badge + Weather Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <AQIBadge aqiData={aqiData} />
            </div>
            <div className="lg:col-span-4">
              <WeatherWidget weather={aqiData.weather} />
            </div>
          </div>

          {/* Morning Thermal Inversion Warning Notice */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-200/80 rounded-3xl p-5 sm:p-6 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900 flex items-center space-x-2">
                  <span>Winter Morning Thermal Inversion Trap Alert</span>
                  <span className="text-[10px] uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
                    Peak Hazard: 6:00 - 9:30 AM
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  Cold ground temperatures trap vehicular exhaust and dense PM2.5 in the lowest 100 meters. 
                  Reschedule morning jogs and delay open-window house airing until midday when solar heating expands the mixing layer.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('plan')}
              className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <span>View Daily Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4-Day Trajectory Trend Chart */}
          <AQITrendChart hourlyData={aqiData.hourly_trends} />

          {/* Target Pollutants Grid */}
          <PollutantGrid pollutants={aqiData.pollutants} />

          {/* Multi-Section Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div 
              onClick={() => onNavigateTab('plan')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-3xl border border-slate-200 hover:border-sky-300 shadow-2xs cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                  Daily Smog Plan
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  4-period timeline with persistent checkboxes and habit tracking.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-sky-600 flex items-center space-x-1">
                <span>View Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('indoor')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-3xl border border-slate-200 hover:border-sky-300 shadow-2xs cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                  Indoor Clean Air
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Free damp-mopping hygiene, low-cost box filters, and draft seals.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Explore Hacks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('sustainable')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-3xl border border-slate-200 hover:border-sky-300 shadow-2xs cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                  Sustainable Living
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Clean heating swaps, non-idling habits, and transit comparisons.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <span>View Swaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('impact')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-3xl border border-slate-200 hover:border-sky-300 shadow-2xs cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                  Impact Tracker
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Log personal exposure reductions & community emissions avoided.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-indigo-600 flex items-center space-x-1">
                <span>Open Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
