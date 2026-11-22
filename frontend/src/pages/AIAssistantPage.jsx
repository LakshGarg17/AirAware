import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Shield, Send, RotateCcw, AlertCircle, 
  MapPin, HelpCircle, Loader2, ArrowUpRight 
} from 'lucide-react';
import { useChat } from '../hooks/useChat';

export default function AIAssistantPage({ currentAqiData, currentLocation, profile }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const aqiVal = currentAqiData?.current_aqi?.aqi;
  const aqiCat = currentAqiData?.current_aqi?.category || 'Current Conditions';
  const locName = currentLocation?.name || 'Delhi, India';
  const lat = currentLocation?.latitude || 28.6139;
  const lon = currentLocation?.longitude || 77.2090;

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLast,
    starterQuestions
  } = useChat(lat, lon, locName, profile);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || isLoading) return;
    sendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = inputText.length;
  const isOverLimit = charCount > 500;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in-50 duration-200">
      {/* Top Header / Context Strip */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <span>AirAware Clean Air Assistant</span>
            </h2>
            {/* Context Chip */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Context: </span>
              <strong className="text-slate-700">US AQI {aqiVal ?? 'N/A'} ({aqiCat})</strong>
              <span>· {locName}</span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          /* Empty State with Starter Questions */
          <div className="py-6 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                How can AirAware help protect your household today?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                Ask about mask types, timing your day around morning thermal inversions, 
                protecting children, or safe room heating methods.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Frequently Asked Smog Queries:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/60 hover:bg-sky-50/50 text-left text-xs text-slate-700 font-medium transition-all group flex items-start justify-between"
                  >
                    <span>{q}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 ml-1.5 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History Bubbles */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-br-xs font-medium'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant Source Badge */}
                  {!isUser && (
                    <div className="flex items-center space-x-1.5 mb-2 pb-2 border-b border-slate-200/60 text-[11px] font-bold">
                      {msg.source === 'ai' ? (
                        <span className="flex items-center space-x-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>AI-generated</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <Shield className="w-3 h-3 text-slate-500" />
                          <span>Rule-based guidance</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content: Safe text rendering without dangerouslySetInnerHTML */}
                  <div className="whitespace-pre-line">
                    {msg.content}
                  </div>
                </div>

                {/* Suggested followups if available */}
                {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 pl-2 max-w-[85%]">
                    {msg.suggested_followups.slice(0, 3).map((fup, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(fup)}
                        className="text-[11px] bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors"
                      >
                        {fup}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 pl-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span>Consulting environmental atmospheric guidance...</span>
          </div>
        )}

        {/* Error Bubble with Retry */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start justify-between gap-3 max-w-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Assistant unavailable:</strong> {error}
              </div>
            </div>
            <button
              onClick={retryLast}
              className="text-xs font-bold text-rose-700 hover:underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="relative flex items-end bg-white border border-slate-200 rounded-2xl p-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            placeholder="Type your clean air or smog question (Enter to send, Shift+Enter for new line)..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none p-1.5"
          />

          <div className="flex flex-col items-end space-y-1 ml-2 shrink-0">
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim() || isOverLimit}
              className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
            <span className={`text-[10px] font-mono ${isOverLimit ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
              {charCount}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
