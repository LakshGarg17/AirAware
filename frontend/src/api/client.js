/**
 * Unified AirAware API Client
 * Centralizes all network communication between React frontend and FastAPI backend.
 * Handles VITE_API_BASE_URL, trailing slashes, normalized error formats ({error:{code, message}}),
 * content-type validation, safe JSON parsing, and cold start retry messaging for free-tier Render deployments.
 */

// Resolves base URL, stripping any trailing slash
export function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';
  return envUrl.replace(/\/+$/, '');
}

const API_BASE = resolveApiBase();

/**
 * Extracts error message from raw response text, handling both structured JSON and plain text.
 */
function extractErrorMessage(rawText, status, defaultMsg) {
  try {
    const data = JSON.parse(rawText);
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
    if (data.message) {
      return data.message;
    }
  } catch {
    // Non-JSON response
  }
  return `${defaultMsg} (HTTP ${status})`;
}

/**
 * Safely handles API response status, content type, and JSON decoding.
 * Throws human-readable errors instead of raw JSON syntax errors (e.g. Unexpected token '<').
 */
export async function handleApiResponse(response, defaultMsg = 'API request failed') {
  const contentType = (response.headers?.get?.('content-type') || '').toLowerCase();
  const isHtml = contentType.includes('text/html');

  // Consume response stream once as text
  const rawText = await response.text();
  const trimmed = rawText.trim();
  const startsWithHtml = isHtml || trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype');

  // Handle non-OK HTTP status codes (4xx, 5xx)
  if (!response.ok) {
    if (startsWithHtml) {
      if (response.status === 404) {
        throw new Error(`API endpoint not found (HTTP 404). Check backend route and VITE_API_BASE_URL.`);
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Backend service is temporarily unavailable (HTTP ${response.status}). If using free-tier Render, the service may be waking up from sleep.`);
      }
      if (response.status >= 500) {
        throw new Error(`Backend server encountered an error (HTTP ${response.status}). Please try again shortly.`);
      }
      throw new Error(`${defaultMsg} (HTTP ${response.status}).`);
    }

    // Structured JSON error
    const errorMsg = extractErrorMessage(rawText, response.status, defaultMsg);
    throw new Error(errorMsg);
  }

  // Response status is 2xx, but could be HTML (e.g., SPA fallback rewrite returning index.html)
  if (startsWithHtml) {
    throw new Error(
      `Received HTML response instead of JSON from API endpoint (HTTP ${response.status}). Check backend service status and verify VITE_API_BASE_URL is configured.`
    );
  }

  // Parse JSON with defensive error handling
  try {
    return JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Malformed JSON response from API endpoint: ${err.message}`);
  }
}

/**
 * Fetch wrapper with cold start retry support (Render free tier) and network error protection
 */
export async function apiFetch(endpoint, options = {}, retries = 1) {
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
    if (err.name === 'AbortError') {
      throw new Error('Request timed out or was cancelled. Please try again.');
    }
    // Browser TypeError on fetch failure (offline, DNS failure, CORS block)
    throw new Error(`Unable to connect to backend service. Please check your network connection and backend status.`);
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
  return await handleApiResponse(res, 'Failed to retrieve air quality data');
}

export async function searchLocations(query, count = 5) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    name: query.trim(),
    count: count.toString()
  });

  const res = await apiFetch(`/api/geocoding/search?${params.toString()}`);
  const data = await handleApiResponse(res, 'Location search failed');
  return data.results || [];
}

export async function fetchDailyRoutines(aqi = null, lifestyle = 'general') {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }
  params.append('lifestyle', lifestyle);

  const res = await apiFetch(`/api/routines?${params.toString()}`);
  return await handleApiResponse(res, 'Failed to load routines');
}

export async function fetchIndoorHacks(aqi = null) {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }

  const res = await apiFetch(`/api/hacks?${params.toString()}`);
  return await handleApiResponse(res, 'Failed to load indoor hacks');
}

export async function fetchSustainableAlternatives() {
  const res = await apiFetch('/api/alternatives');
  return await handleApiResponse(res, 'Failed to load sustainable alternatives');
}

export async function calculatePersonalImpact(payload) {
  const res = await apiFetch('/api/impact/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await handleApiResponse(res, 'Failed to calculate impact');
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
  return await handleApiResponse(res, 'Profile validation failed');
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
  return await handleApiResponse(res, 'Failed to generate personalized daily plan');
}

export async function fetchIndoorTips(aqi = null) {
  const params = new URLSearchParams();
  if (aqi !== null && aqi !== undefined) {
    params.append('aqi', aqi.toString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiFetch(`/api/indoor/tips${query}`);
  return await handleApiResponse(res, 'Failed to load indoor air quality tips');
}

export async function fetchSustainableRecommendations(profile = null) {
  const res = await apiFetch('/api/sustainable/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile || {})
  });
  return await handleApiResponse(res, 'Failed to load sustainable recommendations');
}

export async function fetchImpactCatalog() {
  const res = await apiFetch('/api/impact/catalog');
  return await handleApiResponse(res, 'Failed to load impact catalog');
}

export async function fetchImpactSummary(actions, timezone = 'UTC') {
  const res = await apiFetch('/api/impact/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions, timezone })
  });
  return await handleApiResponse(res, 'Failed to compute impact summary');
}

export async function sendChatMessage(payload, signal = null) {
  const res = await apiFetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  return await handleApiResponse(res, 'Assistant request failed');
}

export async function fetchAiRecommendations(latitude, longitude, profile = null, city = null) {
  const res = await apiFetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, profile, city })
  });
  return await handleApiResponse(res, 'Failed to load recommendations');
}

export async function checkServerHealth() {
  const res = await apiFetch('/api/health');
  return await handleApiResponse(res, 'Health check failed');
}