import React, { useState } from 'react';
import { 
  Sparkles, Search, BookOpen, AlertTriangle, 
  CheckCircle2, ArrowRight, ShieldCheck, Loader2 
} from 'lucide-react';
import { queryRuleAssistant } from '../api/client';

export default function AssistantPage({ currentAqiData }) {
  const [queryInput, setQueryInput] = useState('');
  const [activeResponse, setActiveResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const aqiVal = currentAqiData?.current_aqi?.aqi;

  const sampleQuestions = [
    "Should I wear an N95 mask or surgical mask?",
    "Why is air pollution worse in the early morning?",
    "Is it safe to go for a run when AQI is 180?",
    "How does a HEPA air purifier compare to houseplants?",
    "How can I protect my kids during winter smog?",
    "What is the safest way to heat rooms in winter?"
  ];

  const handleAsk = async (text) => {
    const query = text || queryInput;
    if (!query || !query.trim()) return;

    setIsLoading(true);
    try {
      const res = await queryRuleAssistant(query, aqiVal);
      setActiveResponse(res);
      setQueryInput('');
    } catch (err) {
      console.error('Assistant query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      {/* PHASE NOTICE BANNER (Strict Requirement) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/70 to-yellow-500/10 border-2 border-amber-300 rounded-3xl p-6 text-amber-950 shadow-xs">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Phase Roadmap Notice
              </span>
              <span className="text-xs font-semibold text-amber-800">
                Rule-Based Verification Engine Active
              </span>
            </div>
            <h2 className="text-lg font-black text-amber-950">
              AI Assistant: Coming in the next development phase
            </h2>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              To ensure 100% factual accuracy and zero medical hallucinations during severe smog emergencies,
              this page currently features our verified <strong>Rule-Based Clean Air Knowledge Helper</strong>.
              All responses are sourced directly from WHO, CDC, and atmospheric physics guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>Ask the Rule-Based Clean Air Assistant</span>
        </h3>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
            placeholder="Type your smog or clean air question (e.g. N95 masks, morning jogs, heating safety)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !queryInput.trim()}
            className="px-5 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Consult</span>
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Frequently Consulted Smog Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="text-xs font-medium bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Box */}
      {isLoading && (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Matching against rule-based atmospheric health knowledge base...</p>
        </div>
      )}

      {activeResponse && !isLoading && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                Rule-Based Match ({Math.round(activeResponse.response.confidence * 100)}% Confidence)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {activeResponse.response.title}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
              Deterministic Engine
            </span>
          </div>

          {/* Core Verified Answer */}
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            <p className="whitespace-pre-line">
              {activeResponse.response.answer}
            </p>
          </div>

          {/* Direct Impact Callout */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-teal-950 text-xs flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-teal-900 font-bold block mb-0.5">Direct Health Impact:</strong>
              {activeResponse.response.direct_impact_tip}
            </div>
          </div>

          {/* Reference Attribution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 gap-2">
            <span>
              Authoritative Reference: <strong className="text-slate-600 font-medium">{activeResponse.response.source_reference}</strong>
            </span>
            <span className="italic text-[11px]">
              {activeResponse.disclaimer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
