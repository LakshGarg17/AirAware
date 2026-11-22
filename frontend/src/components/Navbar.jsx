import React, { useState } from 'react';
import { 
  Wind, Shield, Home, RefreshCw, Calculator, Sparkles, 
  Menu, X, MapPin, User, CalendarCheck, Leaf, BarChart3 
} from 'lucide-react';
import { getSeverityStyle } from '../utils/severity';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentLocation, 
  currentAqiData,
  onOpenProfile 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aqiInfo = currentAqiData?.current_aqi;
  const severityStyle = getSeverityStyle(aqiInfo?.severity_key);

  const navItems = [
    { id: 'dashboard', label: 'Smog Dashboard', icon: Wind },
    { id: 'plan', label: 'Daily Plan', icon: CalendarCheck },
    { id: 'indoor', label: 'Indoor Air', icon: Home },
    { id: 'sustainable', label: 'Sustainable Living', icon: Leaf },
    { id: 'impact', label: 'Impact Tracker', icon: BarChart3 },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
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
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Breathe smarter. Live better.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Location, US AQI Pill & Profile Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="font-semibold text-slate-800 max-w-[130px] truncate">
                {currentLocation?.name || 'Locating...'}
              </span>
            </div>

            {aqiInfo && aqiInfo.aqi !== null && (
              <div className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
                <span className="opacity-90 uppercase tracking-wider text-[10px]">US AQI</span>
                <span className="text-sm font-extrabold">{aqiInfo.aqi}</span>
              </div>
            )}

            {/* Profile Drawer Button */}
            <button
              onClick={onOpenProfile}
              title="Edit Profile"
              className="p-2 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Profile"
            >
              <User className="w-5 h-5 text-sky-600" />
            </button>

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
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span className="font-medium">{currentLocation?.name || 'Selected City'}</span>
            </div>
            {aqiInfo && aqiInfo.aqi !== null && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${severityStyle.badgeBg} ${severityStyle.badgeText}`}>
                US AQI {aqiInfo.aqi}
              </span>
            )}
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
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
