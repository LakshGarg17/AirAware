import React, { useState } from 'react';
import { 
  BarChart3, Plus, Trash2, Undo2, Award, Shield, 
  Leaf, Info, CheckCircle2, Clock, Calendar 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { useImpact } from '../hooks/useImpact';

export default function ImpactTrackerPage() {
  const {
    actions,
    catalog,
    summary,
    isLoading,
    logAction,
    deleteAction,
    undoDelete,
    lastDeleted,
    toastMessage
  } = useImpact();

  const [selectedQuickType, setSelectedQuickType] = useState('mask_outdoor');
  const [actionNote, setActionNote] = useState('');

  const handleQuickLog = (e) => {
    e.preventDefault();
    if (!selectedQuickType) return;
    const ok = logAction(selectedQuickType, actionNote);
    if (ok) {
      setActionNote('');
    }
  };

  const todayCounts = summary?.today || { total: 0, exposure_reduction: 0, environmental_contribution: 0 };
  const hasChartData = summary?.has_sufficient_chart_data && summary?.seven_day_series?.length > 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Stateless Personal & Community Action Log
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Clean Air Impact Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Logged locally in your browser. Strictly count-based tracking with zero fabricated emission formulas.
        </p>
      </div>

      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
          {lastDeleted && (
            <button
              onClick={undoDelete}
              className="text-teal-400 font-bold hover:underline flex items-center space-x-1"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {/* Category A vs B Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category A Card */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-3xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-sky-800 font-bold text-sm">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Category A: Personal Exposure Reduction</span>
          </div>
          <p className="text-xs text-sky-900 leading-relaxed">
            Actions like wearing an N95 mask, rescheduling morning walks, or sealing drafts.
          </p>
          <div className="text-[11px] font-semibold text-sky-700 bg-white/80 px-3 py-1.5 rounded-xl border border-sky-200/60 inline-block">
            📌 <em>May reduce your personal exposure; does not change outdoor AQI.</em>
          </div>
        </div>

        {/* Category B Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Category B: Environmental Contribution</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Actions like avoiding vehicle idling, taking electric metro, or composting leaves.
          </p>
          <div className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200/60 inline-block">
            📌 <em>May reduce emissions; does not guarantee an immediate change in local AQI.</em>
          </div>
        </div>
      </div>

      {/* Today's Counts Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Today's Logged Actions</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{todayCounts.total}</span>
          <span className="text-[11px] text-slate-500 font-medium">Verified habit events</span>
        </div>

        <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
          <span className="block text-[10px] uppercase font-bold text-sky-600">Exposure Reductions (Cat A)</span>
          <span className="text-3xl font-black text-sky-700 mt-1 block">{todayCounts.exposure_reduction}</span>
          <span className="text-[11px] text-sky-600 font-medium">Respiratory safeguards</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
          <span className="block text-[10px] uppercase font-bold text-emerald-600">Emissions Mitigated (Cat B)</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{todayCounts.environmental_contribution}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Community contributions</span>
        </div>
      </div>

      {/* Weekly Activity Chart (Strict Rule: only rendered if >= 2 distinct days) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>7-Day Activity Trends</span>
            </h3>
            <p className="text-xs text-slate-400">Strictly counts of verified user-logged actions</p>
          </div>
        </div>

        {hasChartData ? (
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.seven_day_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => val.slice(5)} // MM-DD
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="exposure_reduction" name="Personal Exposure (Cat A)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="environmental_contribution" name="Environmental (Cat B)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-xs">Trend Chart Awaiting Second Day of Data</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              AirAware strictly plots authentic activity trends once actions are logged across at least 
              <strong> 2 distinct calendar days</strong>. Continue your clean-air habits tomorrow to unlock your weekly trajectory!
            </p>
          </div>
        )}
      </div>

      {/* Quick-Log Action Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
          <Plus className="w-4 h-4 text-sky-600" />
          <span>Quick Log an Action</span>
        </h3>

        <form onSubmit={handleQuickLog} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Action Type
            </label>
            <select
              value={selectedQuickType}
              onChange={(e) => setSelectedQuickType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <optgroup label="Personal Exposure Reduction (Category A)">
                {catalog.filter(c => c.category === 'exposure_reduction').map(act => (
                  <option key={act.id} value={act.id}>{act.label}</option>
                ))}
              </optgroup>
              <optgroup label="Environmental Contribution (Category B)">
                {catalog.filter(c => c.category === 'environmental_contribution').map(act => (
                  <option key={act.id} value={act.id}>{act.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Optional Note (max 140 chars)
            </label>
            <input
              type="text"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              maxLength={140}
              placeholder="e.g. Wore N95 during morning metro commute"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Log Action</span>
            </button>
          </div>
        </form>

        {/* Selected Action Explanation */}
        {selectedQuickType && summary?.action_explanations?.[selectedQuickType] && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{summary.action_explanations[selectedQuickType]}</span>
          </div>
        )}
      </div>

      {/* Data-Backed Achievements */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Verified Activity Milestones</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summary?.achievements?.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all ${
                ach.achieved
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs">{ach.title}</span>
                {ach.achieved && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    Earned
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed mb-2">{ach.description}</p>
              <span className="text-[10px] font-mono text-slate-400 block border-t border-slate-200/40 pt-1">
                Rule: {ach.rule}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action History Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Logged History ({actions.length} Total)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Stored in browser (31-day retention)</span>
        </div>

        {actions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No clean air actions logged yet. Use the quick logger above to record your first step!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {actions.map((act) => {
              const def = catalog.find(c => c.id === act.type);
              const isCatA = act.category === 'exposure_reduction';
              return (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs group">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCatA ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                    <div>
                      <span className="font-bold text-slate-800">
                        {def ? def.label : act.type}
                      </span>
                      {act.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{act.note}</p>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAction(act.id)}
                    title="Delete logged action"
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
