import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  fetchAirQuality, 
  handleApiResponse, 
  searchLocations,
  apiFetch
} from '../api/client';

describe('Unified API Client & Response Handling', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully parses valid JSON response on HTTP 200', async () => {
    const mockData = { current_aqi: { aqi: 145, category: 'Unhealthy for Sensitive Groups' } };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
      text: async () => JSON.stringify(mockData)
    });

    const result = await fetchAirQuality(28.61, 77.20, 'Delhi');
    expect(result).toEqual(mockData);
  });

  it('safely handles HTML response on HTTP 200 (SPA rewrite) without throwing raw SyntaxError', async () => {
    const htmlBody = '<!doctype html><html lang="en"><head><title>AirAware</title></head><body><div id="root"></div></body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name) => (name === 'content-type' ? 'text/html; charset=utf-8' : null) },
      text: async () => htmlBody
    });

    await expect(fetchAirQuality(28.61, 77.20)).rejects.toThrow(
      /Received HTML response instead of JSON from API endpoint \(HTTP 200\)/i
    );
  });

  it('safely handles HTML response starting with < even without text/html header', async () => {
    const htmlBody = '<!DOCTYPE html><html><body>Error</body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => htmlBody
    });

    await expect(fetchAirQuality(28.61, 77.20)).rejects.toThrow(
      /Received HTML response instead of JSON from API endpoint/i
    );
  });

  it('safely handles HTTP 404 HTML response with human-readable error', async () => {
    const html404 = '<html><body>404 Not Found</body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: (name) => (name === 'content-type' ? 'text/html' : null) },
      text: async () => html404
    });

    await expect(fetchAirQuality(28.61, 77.20)).rejects.toThrow(
      /API endpoint not found \(HTTP 404\)/i
    );
  });

  it('safely handles HTTP 502/503 HTML response with free-tier wake-up message', async () => {
    const html502 = '<html><body>502 Bad Gateway</body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: (name) => (name === 'content-type' ? 'text/html' : null) },
      text: async () => html502
    });

    await expect(fetchAirQuality(28.61, 77.20)).rejects.toThrow(
      /Backend service is temporarily unavailable \(HTTP 502\)/i
    );
  });

  it('safely handles malformed JSON without throwing raw SyntaxError to caller', async () => {
    const malformedJson = '{ "current_aqi": { "aqi": 100, broken:';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
      text: async () => malformedJson
    });

    await expect(fetchAirQuality(28.61, 77.20)).rejects.toThrow(
      /Malformed JSON response from API endpoint/i
    );
  });

  it('parses structured FastAPI error format {error: {message: "..."}}', async () => {
    const errorJson = JSON.stringify({
      error: { code: 422, message: 'Latitude must be between -90 and 90' }
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
      text: async () => errorJson
    });

    await expect(fetchAirQuality(190, 77.20)).rejects.toThrow(
      'Latitude must be between -90 and 90'
    );
  });

  it('handles network failure (offline, CORS, DNS error) with user-friendly message', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiFetch('/api/air-quality', {}, 0)).rejects.toThrow(
      /Unable to connect to backend service/i
    );
  });
});
