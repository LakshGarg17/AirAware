import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, ReferenceLine 
} from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { getSeverityStyle } from '../utils/severity';

const CustomTooltip = ({ active, payload, label, mode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const severity = getSeverityStyle(data.severity_key);

    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs z-50">
        <p className="font-semibold text-slate-600 mb-1">
          {new Date(data.time).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
        <div className="flex items-center space-x-2 my-1">
          <span className={`w-2.5 h-2.5 rounded-full ${severity.indicatorDot}`} />
          <span className="font-bold text-slate-900 text-sm">
            {mode === 'aqi' ? `US AQI: ${data.us_aqi ?? 'N/A'}` : `PM2.5: ${data.pm2_5 ?? 'N/A'} μg/m³`}
          </span>
        </div>
        <p className={`font-semibold text-[11px] ${severity.textClass}`}>
          Category: {data.category}
        </p>
      </div>
    );
  }
  return null;
};

export default function AQITrendChart({ hourlyData }) {
  const [metricMode, setMetricMode] = useState('aqi'); // 'aqi' or 'pm25'

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-400 text-sm">
        No hourly trend data available.
      </div>
    );
  }

  // Format data for chart display
  const chartData = hourlyData.map((d) => ({
    ...d,
    displayTime: new Date(d.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }),
    shortDate: new Date(d.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const dataKey = metricMode === 'aqi' ? 'us_aqi' : 'pm2_5';
  const strokeColor = metricMode === 'aqi' ? '#0284c7' : '#f97316';
  const fillColor = metricMode === 'aqi' ? '#e0f2fe' : '#ffedd5';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">
              4-Day Environmental Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Past 2 days historical trend + 2 days hourly forecast (Open-Meteo)
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMetricMode('aqi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricMode === 'aqi'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            US AQI Index
          </button>
          <button
            onClick={() => setMetricMode('pm25')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricMode === 'pm25'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PM2.5 (μg/m³)
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="displayTime" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip mode={metricMode} />} />

            {/* EPA Standard Reference Lines (when displaying US AQI) */}
            {metricMode === 'aqi' && (
              <>
                <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Good (50)', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Moderate (100)', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Unhealthy (150)', fill: '#f97316', fontSize: 10, position: 'right' }} />
              </>
            )}

            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={strokeColor} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#metricGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span>US AQI Trend</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>PM2.5 Mass</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Showing 96 hourly intervals across 4 days
        </p>
      </div>
    </div>
  );
}
