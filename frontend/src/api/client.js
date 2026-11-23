/**
 * Unified AirAware API Client
 * Centralizes all network communication between React frontend and FastAPI backend.
 * Handles VITE_API_BASE_URL, trailing slashes, normalized error formats ({error:{code, message}}),
 * and cold start retry messaging for free-tier Render deployments.
 */

// Resolves base URL, stripping any trailing slash
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';
  return envUrl.replace(/\/+$/, '');
}

const API_BASE = resolveApiBase();

/**
 * Normalizes API error payload from JSON responses
 */
async function parseApiError(response, defaultMsg) {
  try {
    const data = await response.json();
    if (data.error && data.error.message) {
      return data.error.message;
    }
    if (data.detail) {
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
      }
      return JSON.stringify(data.detail);
    }
  } catch {
    // Non-JSON response
  }
  return `${defaultMsg} (HTTP ${response.status})`;
}

/**
 * Fetch wrapper with cold start retry support (Render free tier)
 */
async function apiFetch(endpoint, options = {}, retries = 1) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (retries > 0) {
      // Small pause before retry to absorb brief network blips or cold start wakeup
      await new Promise((r) => setTimeout(r, 1000));
      return apiFetch(endpoint, options, retries - 1);
    }
    throw err;
  }
}

// -----------------------------------------------------------------------------
// Core Days 1-3 Endpoints
// -----------------------------------------------------------------------------

export async function fetchAirQuality(latitude, longitude, cityName = null) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (cityName) {
    params.append('city', cityName);
  }

  const res = await apiFetch(`/api/air-quality?${params.toString()}`);
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to retrieve air quality data');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function searchLocations(query, count = 5) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    name: query.trim(),
    count: count.toString()
  });

  const res = await apiFetch(`/api/geocoding/search?${params.toString()}`);
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Location search failed');
    throw new Error(errorMsg);
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

  const res = await apiFetch(`/api/routines?${params.toString()}`);
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load routines');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchIndoorHacks(aqi = null) {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }

  const res = await apiFetch(`/api/hacks?${params.toString()}`);
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load indoor hacks');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchSustainableAlternatives() {
  const res = await apiFetch('/api/alternatives');
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load sustainable alternatives');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function calculatePersonalImpact(payload) {
  const res = await apiFetch('/api/impact/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to calculate impact');
    throw new Error(errorMsg);
  }
  return await res.json();
}

// -----------------------------------------------------------------------------
// Days 4-6 Endpoints: Personalization, Planner, Indoor, Sustainable, Impact, AI
// -----------------------------------------------------------------------------

export async function validateProfile(profile) {
  const res = await apiFetch('/api/profile/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Profile validation failed');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function generateDailyPlan(latitude, longitude, profile = null, variation = 0, city = null) {
  const res = await apiFetch('/api/plan/daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude,
      longitude,
      profile,
      variation,
      city
    })
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to generate personalized daily plan');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchIndoorTips(aqi = null) {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiFetch(`/api/indoor/tips${query}`);
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load indoor air quality tips');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchSustainableRecommendations(profile = null) {
  const res = await apiFetch('/api/sustainable/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile || {})
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load sustainable recommendations');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchImpactCatalog() {
  const res = await apiFetch('/api/impact/catalog');
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load impact catalog');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchImpactSummary(actions, timezone = 'UTC') {
  const res = await apiFetch('/api/impact/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions, timezone })
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to compute impact summary');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function sendChatMessage(payload, signal = null) {
  const res = await apiFetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Assistant request failed');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchAiRecommendations(latitude, longitude, profile = null, city = null) {
  const res = await apiFetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, profile, city })
  });
  if (!res.ok) {
    const errorMsg = await parseApiError(res, 'Failed to load recommendations');
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function checkServerHealth() {
  const res = await apiFetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check returned status ${res.status}`);
  }
  return await res.json();
}
