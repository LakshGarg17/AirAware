import React from 'react';
import { Wind, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Brand & Purpose */}
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
              <Wind className="w-4 h-4 text-sky-600" />
              <span>AirAware Smog Navigator</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Empowering families, daily commuters, and urban communities with actionable smog forecasts,
              evidence-based indoor air quality hacks, and low-emission daily routines.
            </p>
          </div>

          {/* Column 2: Data Sources & Attribution */}
          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Data & Standards Attribution
            </h4>
            <p className="text-slate-500 leading-relaxed mb-2">
              Environmental observations and weather forecasts are powered by{' '}
              <a 
                href="https://open-meteo.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-sky-600 hover:underline inline-flex items-center font-medium"
              >
                Open-Meteo API
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>{' '}
              under Creative Commons Attribution 4.0 International (CC BY 4.0).
            </p>
            <p className="text-slate-400 text-[11px]">
              Note: Open-Meteo free API is strictly for non-commercial use. Commercial use requires an official Open-Meteo subscription.
            </p>
          </div>

          {/* Column 3: Health Disclaimer & Standards */}
          <div>
            <div className="flex items-center space-x-1.5 text-amber-700 font-semibold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Standard & Health Notice</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              AirAware strictly displays the <strong className="text-slate-700">US AQI (United States Environmental Protection Agency)</strong> standard 
              across all calculations. Health guidance is informational and does not replace medical advice from qualified healthcare professionals.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} AirAware Platform — PromptWars Virtual Challenge 06.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with care for clean air and healthy communities</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
