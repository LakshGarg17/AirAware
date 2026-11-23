import React, { useState, useEffect } from 'react';
import { 
  Home, CheckCircle2, AlertOctagon, DollarSign, Wrench, 
  Sparkles, ShieldCheck, Filter, Loader2, Info 
} from 'lucide-react';
import { fetchIndoorTips } from '../api/client';

export default function IndoorAirPage({ aqiData }) {
  const [tipsData, setTipsData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const aqiVal = aqiData?.current_aqi?.aqi;

  useEffect(() => {
    let isMounted = true;
    async function loadTips() {
      setIsLoading(true);
      try {
        const data = await fetchIndoorTips(aqiVal);
        if (isMounted) setTipsData(data);
      } catch (err) {
        console.error("Failed to fetch indoor tips:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTips();
    return () => { isMounted = false; };
  }, [aqiVal]);

  const groups = ['All', 'Free', 'Low-Cost', 'Equipment-Based'];

  // Flatten tips based on group filter
  const allTips = tipsData?.groups ? [
    ...(selectedGroup === 'All' || selectedGroup === 'Free' ? tipsData.groups.Free || [] : []),
    ...(selectedGroup === 'All' || selectedGroup === 'Low-Cost' ? tipsData.groups['Low-Cost'] || [] : []),
    ...(selectedGroup === 'All' || selectedGroup === 'Equipment-Based' ? tipsData.groups['Equipment-Based'] || [] : []),
  ] : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          Indoor Sanctuary Science
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Indoor Clean Air Guidance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Grouped by affordability: Free behavioral hygiene, Low-Cost seals and filters, and Equipment-based solutions.
        </p>
      </div>

      {/* Outdoor AQI Context Notice */}
      {tipsData && (
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 text-xs text-teal-950 flex items-start space-x-3">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5">Atmospheric Condition Awareness:</strong>
            {tipsData.outdoor_context_summary}
          </div>
        </div>
      )}

      {/* Golden Rules Banner */}
      {tipsData?.golden_rules && (
        <div className="bg-gradient-to-tr from-teal-950 via-slate-900 to-neutral-900 text-teal-50 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>5 Golden Rules of Winter Smog Defense</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {tipsData.golden_rules.map((rule, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Filter Buttons */}
      <div className="flex items-center justify-center gap-2">
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedGroup === grp
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading evidence-based indoor air guidelines...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTips.map((tip) => (
            <div 
              key={tip.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                    {tip.tier}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {tip.cost}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {tip.title}
                </h3>

                <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50/50 px-2 py-0.5 rounded-md mb-3">
                  ⚡ Efficiency: {tip.pm25_reduction_efficiency}
                </span>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {tip.what_to_do}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">Scientific Reason:</strong>
                  {tip.why_it_matters}
                </div>

                <div className="space-y-1 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Practical Steps:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600">
                    {tip.practical_steps.map((st, i) => <li key={i}>{st}</li>)}
                  </ul>
                </div>
              </div>

              {tip.common_pitfalls && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-rose-800 bg-rose-50/60 p-2.5 rounded-xl flex items-start space-x-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Avoid: </strong>
                    {tip.common_pitfalls}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Medical Disclaimer Note */}
      <div className="text-center text-xs text-slate-400 py-4">
        {tipsData?.disclaimer}
      </div>
    </div>
  );
}
