import React from 'react';
import { 
  Sun, Moon, Cloud, CloudSun, CloudMoon, CloudFog, CloudDrizzle, 
  CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, Compass 
} from 'lucide-react';

export default function WeatherWidget({ weather }) {
  if (!weather) return null;

  // Icon resolver based on condition_icon string
  const getIcon = () => {
    const icon = weather.condition_icon || 'cloud';
    switch (icon) {
      case 'sun': return <Sun className="w-7 h-7 text-amber-500" />;
      case 'moon': return <Moon className="w-7 h-7 text-indigo-400" />;
      case 'cloud-sun': return <CloudSun className="w-7 h-7 text-amber-500" />;
      case 'cloud-moon': return <CloudMoon className="w-7 h-7 text-indigo-400" />;
      case 'cloud-fog': return <CloudFog className="w-7 h-7 text-slate-400" />;
      case 'cloud-drizzle': return <CloudDrizzle className="w-7 h-7 text-sky-400" />;
      case 'cloud-rain': return <CloudRain className="w-7 h-7 text-blue-500" />;
      case 'cloud-snow': return <CloudSnow className="w-7 h-7 text-sky-200" />;
      case 'cloud-lightning': return <CloudLightning className="w-7 h-7 text-amber-500" />;
      default: return <Cloud className="w-7 h-7 text-slate-400" />;
    }
  };

  const formatVal = (val, fallback = 'N/A') => {
    return val !== null && val !== undefined ? val : fallback;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-sky-600" />
          <span>Local Atmospheric Conditions</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Open-Meteo Weather</span>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatVal(weather.temperature)}
            </span>
            <span className="text-lg font-semibold text-slate-500">
              {weather.temperature_unit || '°C'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">
            {weather.condition_label || 'Current Condition'}
            {weather.apparent_temperature !== null && weather.apparent_temperature !== undefined && (
              <span className="text-slate-400 font-normal ml-1.5">
                (Feels like {weather.apparent_temperature}{weather.temperature_unit || '°C'})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <Droplets className="w-4 h-4 mx-auto text-sky-500 mb-1" />
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Humidity</span>
          <span className="text-xs font-extrabold text-slate-800">
            {formatVal(weather.relative_humidity)}{weather.relative_humidity_unit || '%'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5">
          <Wind className="w-4 h-4 mx-auto text-teal-500 mb-1" />
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Wind</span>
          <span className="text-xs font-extrabold text-slate-800">
            {formatVal(weather.wind_speed)} {weather.wind_speed_unit || 'km/h'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5">
          <Compass className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Direction</span>
          <span className="text-xs font-extrabold text-slate-800">
            {formatVal(weather.wind_direction)}{weather.wind_direction_unit || '°'}
          </span>
        </div>
      </div>
    </div>
  );
}
