import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, Leaf, Zap, Flame, 
  Trash2, Building, RefreshCw, Loader2 
} from 'lucide-react';
import { fetchSustainableAlternatives } from '../api/client';

export default function AlternativesPage() {
  const [data, setData] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAlternatives() {
      setIsLoading(true);
      try {
        const res = await fetchSustainableAlternatives();
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load alternatives:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAlternatives();
    return () => { isMounted = false; };
  }, []);

  const domains = ['All', ...(data?.domains || [])];
  const filteredItems = data?.alternatives?.filter((a) => 
    selectedDomain === 'All' ? true : a.domain === selectedDomain
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Source Reduction & Community Mitigation
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Sustainable Winter Alternatives
        </h1>
        <p className="text-sm text-slate-600">
          Swapping high-emission practices for clean, modern solutions across commuting, space heating, and waste management.
        </p>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center flex-wrap gap-2 justify-center">
        {domains.map((dom) => (
          <button
            key={dom}
            onClick={() => setSelectedDomain(dom)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedDomain === dom
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Alternatives Comparison Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading sustainable alternatives...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {filteredItems.map((alt) => (
            <div 
              key={alt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
            >
              {/* Header Pill & Domain */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {alt.domain}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Adoption Ease: <strong className="text-slate-700">{alt.ease_of_adoption}</strong>
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                {/* Conventional Practice */}
                <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-rose-700 mb-1">
                    Conventional Smog-Causing Habit
                  </span>
                  <h4 className="text-sm font-bold text-rose-950">
                    {alt.conventional_practice}
                  </h4>
                </div>

                {/* Sustainable Swap */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1">
                    Recommended Sustainable Swap
                  </span>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {alt.sustainable_swap}
                  </h4>
                </div>
              </div>

              {/* Direct Impact Narrative */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 my-4 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Why This Choice Matters (Direct Impact):</strong>
                {alt.direct_impact_explanation}
              </div>

              {/* Footer Impact Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Emissions Prevented</span>
                  <span className="text-xs font-bold text-emerald-700">{alt.emissions_impact}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Health Dividend</span>
                  <span className="text-xs font-bold text-sky-700">{alt.health_benefit}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Annual CO2 Saved</span>
                  <span className="text-xs font-extrabold text-slate-900">~{alt.annual_co2_saving_kg} kg CO2e / year</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
