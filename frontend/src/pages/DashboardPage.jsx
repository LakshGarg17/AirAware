import React from 'react';
import { AlertCircle, Clock, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
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
  onNavigateTab
}) {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner / Location Search Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Navigate Winter Smog with <span className="text-sky-600">Actionable Clarity</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Real-time US AQI standards, atmospheric inversion forecasts, and evidence-based routines for your household.
        </p>
        <div className="pt-2">
          <LocationSearch 
            onLocationSelect={onLocationSelect} 
            currentLocation={currentLocation}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-sm">
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
          <p className="text-slate-500 font-medium text-sm">Retrieving atmospheric observations from Open-Meteo...</p>
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
              onClick={() => onNavigateTab('routines')}
              className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <span>View Smog Routines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4-Day Trajectory Trend Chart */}
          <AQITrendChart hourlyData={aqiData.hourly_trends} />

          {/* Target Pollutants Grid */}
          <PollutantGrid pollutants={aqiData.pollutants} />

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <div 
              onClick={() => onNavigateTab('hacks')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                🧹
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                DIY Indoor Air Hacks
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Build a $25 Corsi-Rosenthal box filter, implement wet-mopping hygiene, and seal window draft gaps.
              </p>
            </div>

            <div 
              onClick={() => onNavigateTab('alternatives')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                🌱
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Sustainable Winter Alternatives
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clean space heating swaps, composting over leaf burning, and low-emission transit comparisons.
              </p>
            </div>

            <div 
              onClick={() => onNavigateTab('impact')}
              className="bg-white hover:bg-sky-50/50 p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                📊
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Personal Impact Calculator
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Calculate your personal PM2.5 exposure reduction and weekly carbon emissions avoided.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
