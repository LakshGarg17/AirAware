import React, { useState, useEffect } from 'react';
import { 
  Home, CheckCircle2, AlertOctagon, DollarSign, Wrench, 
  Sparkles, ShieldCheck, Filter, Loader2, ArrowRight 
} from 'lucide-react';
import { fetchIndoorHacks } from '../api/client';

export default function HacksPage({ currentAqiData }) {
  const [hacksData, setHacksData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const aqiVal = currentAqiData?.current_aqi?.aqi;

  useEffect(() => {
    let isMounted = true;
    async function loadHacks() {
      setIsLoading(true);
      try {
        const data = await fetchIndoorHacks(aqiVal);
        if (isMounted) setHacksData(data);
      } catch (err) {
        console.error('Failed to load indoor hacks:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHacks();
    return () => { isMounted = false; };
  }, [aqiVal]);

  const categories = ['All', 'Air Filtration', 'Cleaning & Dust', 'Infiltration Defense', 'Ventilation Timing', 'Cooking & Combustion', 'Indoor Environment'];

  const filteredHacks = hacksData?.hacks?.filter((h) => 
    selectedCategory === 'All' ? true : h.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          Indoor Sanctuary Science
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Indoor Air Quality Hacks
        </h1>
        <p className="text-sm text-slate-600">
          Low-cost, physics-backed interventions to cut indoor fine particulate infiltration by up to 90%.
        </p>
      </div>

      {/* Golden Rules Banner */}
      {hacksData?.golden_rules && (
        <div className="bg-gradient-to-tr from-teal-900 to-slate-900 text-teal-50 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>5 Golden Rules of Winter Smog Hygiene</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hacksData.golden_rules.map((rule, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-xs leading-relaxed flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hacks Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading evidence-based hacks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {filteredHacks.map((hack) => (
            <div 
              key={hack.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {hack.category}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] font-semibold">
                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {hack.cost_level}
                    </span>
                    <span className="text-slate-500">
                      {hack.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {hack.title}
                </h3>

                {/* Reduction efficiency */}
                <div className="inline-block bg-teal-500/10 text-teal-800 text-xs font-bold px-3 py-1 rounded-xl mb-3 border border-teal-200/60">
                  ⚡ Efficiency: {hack.pm25_reduction_pct}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {hack.description}
                </p>

                {/* How it works */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 mb-4">
                  <strong className="text-slate-900 block mb-1">Scientific Mechanism:</strong>
                  {hack.how_it_works}
                </div>

                {/* Actionable Steps */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Step-by-Step Implementation:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                    {hack.steps.map((st, i) => (
                      <li key={i} className="leading-snug">{st}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Pitfall Alert */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-xs text-rose-800 bg-rose-50/70 p-3 rounded-xl">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Common Pitfall: </strong>
                  {hack.common_pitfalls}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
