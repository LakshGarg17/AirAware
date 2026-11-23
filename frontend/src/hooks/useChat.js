import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../api/client';

const INITIAL_STARTER_QUESTIONS = [
  "Should I wear an N95 mask or surgical mask today?",
  "When does the morning winter inversion lift?",
  "Is it safe to go for a run when US AQI is 185?",
  "How does a HEPA air purifier compare to houseplants?",
  "How can I protect my kids on the school commute?",
  "What is the safest way to heat rooms in winter?",
  "What is the difference between PM2.5 and PM10?",
  "Can I open windows to ventilate this afternoon?",
  "Why is motorcycle commuting hazardous in winter?",
  "How can I build a DIY Corsi-Rosenthal box filter?"
];

export function useChat(latitude, longitude, city, profile) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim() || isLoading) return;
    const cleanText = text.trim().slice(0, 500);

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Prepare history
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content
    }));

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    // 35s timeout for cold start
    const timeoutId = setTimeout(() => {
      abortCtrl.abort();
    }, 35000);

    try {
      const data = await sendChatMessage({
        message: cleanText,
        history: historyPayload,
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
        city: city || 'Delhi, India',
        profile
      }, abortCtrl.signal);

      clearTimeout(timeoutId);

      const assistantMessage = {
        id: `msg_assistant_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        source: data.source, // 'ai' or 'rules'
        fallbackReason: data.fallback_reason,
        suggestedFollowups: data.suggested_followups || [],
        contextUsed: data.context_used,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out or was cancelled. Server may be warming up—please retry.");
      } else {
        setError(err.message || "Failed to reach clean air assistant. Please check connection.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, latitude, longitude, city, profile]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
  }, []);

  const retryLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLast,
    starterQuestions: INITIAL_STARTER_QUESTIONS
  };
}
