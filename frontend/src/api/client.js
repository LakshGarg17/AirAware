/**
 * Unified AirAware API Client
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchAirQuality(latitude, longitude, cityName = null) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (cityName) {
    params.append('city', cityName);
  }

  const res = await fetch(`${API_BASE}/air-quality?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Air quality request failed with status ${res.status}`);
  }
  return await res.json();
}

export async function searchLocations(query, count = 5) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    name: query.trim(),
    count: count.toString()
  });

  const res = await fetch(`${API_BASE}/geocoding/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Location search failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.results || [];
}

export async function fetchDailyRoutines(aqi = null, lifestyle = 'general') {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }
  params.append('lifestyle', lifestyle);

  const res = await fetch(`${API_BASE}/routines?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load routines: ${res.status}`);
  }
  return await res.json();
}

export async function fetchIndoorHacks(aqi = null) {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }

  const res = await fetch(`${API_BASE}/hacks?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load indoor hacks: ${res.status}`);
  }
  return await res.json();
}

export async function fetchSustainableAlternatives() {
  const res = await fetch(`${API_BASE}/alternatives`);
  if (!res.ok) {
    throw new Error(`Failed to load sustainable alternatives: ${res.status}`);
  }
  return await res.json();
}

export async function calculatePersonalImpact(payload) {
  const res = await fetch(`${API_BASE}/impact/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate impact: ${res.status}`);
  }
  return await res.json();
}

export async function queryRuleAssistant(query, currentAqi = null, lifestyle = 'general') {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, current_aqi: currentAqi, lifestyle })
  });
  if (!res.ok) {
    throw new Error(`Failed to consult assistant: ${res.status}`);
  }
  return await res.json();
}
