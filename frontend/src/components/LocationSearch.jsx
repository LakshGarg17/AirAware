import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Compass, X } from 'lucide-react';
import { searchLocations } from '../api/client';

const PRESET_CITIES = [
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 }
];

export default function LocationSearch({ onLocationSelect, currentLocation, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchTerm);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Geocoding error:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onLocationSelect({
      name: item.name + (item.admin1 ? `, ${item.admin1}` : '') + (item.country ? ` (${item.country})` : ''),
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone
    });
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationSelect({
          name: 'My Current Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        alert(`Unable to retrieve your location: ${err.message}`);
      }
    );
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
      {/* Search Bar Input Container */}
      <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-slate-200/80 hover:border-sky-300 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100 transition-all p-1.5">
        <div className="pl-3.5 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-sky-600" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder="Search any city or region worldwide (e.g. Delhi, Lahore, New York)..."
          className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none py-2"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isSearching && (
          <div className="pr-3 text-sky-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        <button
          onClick={handleUseCurrentLocation}
          title="Use GPS Geolocation"
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:border-sky-200 transition-all ml-1 shrink-0"
        >
          <Compass className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">Detect GPS</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 duration-150">
          {suggestions.map((loc) => (
            <button
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 hover:bg-sky-50/80 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{loc.name}</span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country || ''}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-sky-600">
                {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Preset Winter Smog Hotspots */}
      <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
        <span className="text-slate-500 font-medium mr-1 flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> Winter Hotspots:
        </span>
        {PRESET_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => onLocationSelect({
              name: `${city.name} (${city.country})`,
              latitude: city.latitude,
              longitude: city.longitude
            })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              currentLocation?.name?.includes(city.name)
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
