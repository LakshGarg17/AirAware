import React, { useState } from 'react';
import { Wind, Shield, Home, RefreshCw, Calculator, Sparkles, Menu, X, MapPin } from 'lucide-react';
import { getSeverityStyle } from '../utils/severity';

export default function Navbar({ activeTab, setActiveTab, currentLocation, currentAqiData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aqiInfo = currentAqiData?.current_aqi;
  const severityStyle = getSeverityStyle(aqiInfo?.severity_key);

  const navItems = [
    { id: 'dashboard', label: 'Smog Dashboard', icon: Wind },
    { id: 'routines', label: 'Daily Routines', icon: RefreshCw },
    { id: 'hacks', label: 'Indoor Hacks', icon: Home },
    { id: 'alternatives', label: 'Sustainable Swaps', icon: Shield },
    { id: 'impact', label: 'Impact Calculator', icon: Calculator },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Rule-Based' },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Air<span className="text-sky-600">Aware</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">Smog Shield</span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Winter Smog & Low-Emission Guide</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Location & Current AQI Summary Pill */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-semibold text-slate-800 max-w-[140px] truncate">
                {currentLocation?.name || 'Locating...'}
              </span>
            </div>

            {aqiInfo && aqiInfo.aqi !== null && (
              <div className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
                <span className="opacity-90 uppercase tracking-wider text-[10px]">US AQI</span>
                <span className="text-sm font-extrabold">{aqiInfo.aqi}</span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {aqiInfo && aqiInfo.aqi !== null && (
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
                <span className="text-[10px] mr-1">US AQI</span>
                <span>{aqiInfo.aqi}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="flex items-center space-x-2 py-2 px-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span className="font-medium">{currentLocation?.name || 'Selected City'}</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
