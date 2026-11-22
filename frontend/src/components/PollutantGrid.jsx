import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PollutantGrid({ pollutants }) {
  if (!pollutants || pollutants.length === 0) {
    return null;
  }

  // Filter to only pollutants that are actually returned by the API
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Target Pollutant Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time concentration levels with dynamic sensor units
          </p>
        </div>
        <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
          {pollutants.length} Active Sensors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutants.map((item) => {
          const isAvailable = item.value !== null && item.value !== undefined;
          const displayVal = isAvailable ? item.value : 'Unavailable';

          return (
            <div 
              key={item.key}
              className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.key.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-baseline space-x-1.5 my-2">
                  <span className={`text-2xl font-black ${isAvailable ? 'text-slate-900' : 'text-slate-400 text-lg'}`}>
                    {displayVal}
                  </span>
                  {isAvailable && (
                    <span className="text-xs font-semibold text-slate-500">
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed border-t border-slate-200/60 pt-2 mt-1">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
