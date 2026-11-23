import React, { useState, useEffect } from 'react';
import { Leaf, ArrowRight, ShieldCheck, Heart, Sparkles, Loader2 } from 'lucide-react';
import { fetchSustainableRecommendations } from '../api/client';

export default function SustainableLivingPage({ profile }) {
  const [data, setData] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const resData = await fetchSustainableRecommendations(profile);
        if (isMounted) setData(resData);
      } catch (err) {
        console.error("Failed to load sustainable recommendations:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [profile]);

  const allRecs = data?.recommendations || [];
  const domains = ['All', ...new Set(allRecs.map(r => r.domain))];

  const filtered = allRecs.filter(r => selectedDomain === 'All' ? true : r.domain === selectedDomain);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Source Reduction & Community Stewardship
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Sustainable Winter Living
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Pragmatic habit swaps that lower community emissions without shame or unrealistic perfection.
        </p>
      </div>

      {/* Philosophy Banner */}
      {data?.philosophy && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-start space-x-3">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {data.philosophy}
          </p>
        </div>
      )}

      {/* Domain Filters */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {domains.map((dom) => (
          <button
            key={dom}
            onClick={() => setSelectedDomain(dom)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedDomain === dom
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Recommendations Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading tailored sustainable swaps...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider text-[10px]">
                  {item.domain}
                </span>
                <span className="text-slate-500 font-semibold">
                  Difficulty: <strong className="text-slate-800">{item.difficulty}</strong>
                </span>
              </div>

              {/* Side-by-Side Swap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/60">
                  <span className="block text-[10px] font-extrabold uppercase text-rose-700 mb-0.5">Conventional Practice</span>
                  <span className="font-bold text-rose-950">{item.conventional_practice}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="block text-[10px] font-extrabold uppercase text-emerald-700 mb-0.5">Sustainable Swap</span>
                  <span className="font-bold text-emerald-950">{item.sustainable_swap}</span>
                </div>
              </div>

              {/* Narrative & What is changeable */}
              <div className="space-y-2 text-xs text-slate-700">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Why It Matters: </strong>
                  {item.why_it_matters}
                </p>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900">Realistic First Step: </strong>
                  {item.what_is_changeable}
                </p>
              </div>

              {/* Qualitative Benefit */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{item.qualitative_benefit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
