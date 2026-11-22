/**
 * Centralized severity-to-Tailwind style mapping.
 * The backend computes and sends the severity_key; this module strictly maps
 * the key to visual presentation (badges, card backgrounds, text, and chart tokens).
 * No AQI numerical thresholds are duplicated here.
 */

export const SEVERITY_CONFIG = {
  good: {
    label: "Good",
    badgeBg: "bg-emerald-500",
    badgeText: "text-white",
    cardBg: "bg-emerald-50/70 border-emerald-200",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-300",
    glowClass: "shadow-emerald-200",
    progressBg: "bg-emerald-500",
    chartColor: "#10b981",
    indicatorDot: "bg-emerald-500",
    bannerBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
  },
  moderate: {
    label: "Moderate",
    badgeBg: "bg-amber-500",
    badgeText: "text-slate-900",
    cardBg: "bg-amber-50/70 border-amber-200",
    textClass: "text-amber-700",
    borderClass: "border-amber-300",
    glowClass: "shadow-amber-200",
    progressBg: "bg-amber-500",
    chartColor: "#f59e0b",
    indicatorDot: "bg-amber-500",
    bannerBg: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
  },
  sensitive_unhealthy: {
    label: "Unhealthy for Sensitive Groups",
    badgeBg: "bg-orange-500",
    badgeText: "text-white",
    cardBg: "bg-orange-50/70 border-orange-200",
    textClass: "text-orange-700",
    borderClass: "border-orange-300",
    glowClass: "shadow-orange-200",
    progressBg: "bg-orange-500",
    chartColor: "#f97316",
    indicatorDot: "bg-orange-500",
    bannerBg: "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
  },
  unhealthy: {
    label: "Unhealthy",
    badgeBg: "bg-rose-500",
    badgeText: "text-white",
    cardBg: "bg-rose-50/70 border-rose-200",
    textClass: "text-rose-700",
    borderClass: "border-rose-300",
    glowClass: "shadow-rose-200",
    progressBg: "bg-rose-500",
    chartColor: "#ef4444",
    indicatorDot: "bg-rose-500",
    bannerBg: "bg-gradient-to-r from-rose-600 to-red-600 text-white"
  },
  very_unhealthy: {
    label: "Very Unhealthy",
    badgeBg: "bg-purple-600",
    badgeText: "text-white",
    cardBg: "bg-purple-50/70 border-purple-200",
    textClass: "text-purple-700",
    borderClass: "border-purple-300",
    glowClass: "shadow-purple-200",
    progressBg: "bg-purple-600",
    chartColor: "#8b5cf6",
    indicatorDot: "bg-purple-600",
    bannerBg: "bg-gradient-to-r from-purple-700 to-violet-800 text-white"
  },
  hazardous: {
    label: "Hazardous",
    badgeBg: "bg-red-950",
    badgeText: "text-red-100",
    cardBg: "bg-red-950/10 border-red-900/30",
    textClass: "text-red-900",
    borderClass: "border-red-900",
    glowClass: "shadow-red-900/30",
    progressBg: "bg-red-950",
    chartColor: "#881337",
    indicatorDot: "bg-red-950",
    bannerBg: "bg-gradient-to-r from-red-950 via-purple-950 to-neutral-900 text-red-100"
  },
  unavailable: {
    label: "Unavailable",
    badgeBg: "bg-slate-400",
    badgeText: "text-white",
    cardBg: "bg-slate-50 border-slate-200",
    textClass: "text-slate-600",
    borderClass: "border-slate-300",
    glowClass: "shadow-slate-200",
    progressBg: "bg-slate-400",
    chartColor: "#94a3b8",
    indicatorDot: "bg-slate-400",
    bannerBg: "bg-slate-700 text-white"
  }
};

export function getSeverityStyle(severityKey) {
  if (!severityKey || !SEVERITY_CONFIG[severityKey]) {
    return SEVERITY_CONFIG.unavailable;
  }
  return SEVERITY_CONFIG[severityKey];
}
