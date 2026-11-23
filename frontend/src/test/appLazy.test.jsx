import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

vi.mock('../api/client', () => ({
  fetchAirQuality: vi.fn().mockResolvedValue({
    current_aqi: { aqi: 155, category: 'Unhealthy', severity_key: 'unhealthy' },
    hourly_trend: []
  }),
  searchLocations: vi.fn().mockResolvedValue([]),
  generateDailyPlan: vi.fn().mockResolvedValue({ periods: [] }),
  fetchIndoorTips: vi.fn().mockResolvedValue({ immediate_actions: [], groups: { 'Free': [], 'Low-Cost': [], 'Equipment-Based': [] } }),
  fetchSustainableRecommendations: vi.fn().mockResolvedValue({ high_impact_swaps: [] }),
  fetchImpactCatalog: vi.fn().mockResolvedValue([]),
  fetchImpactSummary: vi.fn().mockResolvedValue({ 
    today: { total: 0, exposure_reduction: 0, environmental_contribution: 0 },
    has_sufficient_chart_data: false,
    seven_day_series: []
  }),
  sendChatMessage: vi.fn().mockResolvedValue({ reply: 'Clean air advice', source: 'rules' })
}));

describe('App Lazy-Loaded Tabs and Suspense Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Dashboard tab by default without suspense delay', async () => {
    render(<App />);
    expect(screen.getByText(/Navigate Winter Smog with/i)).toBeInTheDocument();
  });

  it('navigates to Daily Plan and loads lazy component cleanly', async () => {
    render(<App />);
    const planTabBtn = screen.getAllByText('Daily Plan')[0];
    fireEvent.click(planTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Daily Smog Navigation Plan/i)).toBeInTheDocument();
    });
  });

  it('navigates to Indoor Air and loads lazy component cleanly', async () => {
    render(<App />);
    const indoorTabBtn = screen.getAllByText('Indoor Air')[0];
    fireEvent.click(indoorTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Indoor Clean Air Guidance/i)).toBeInTheDocument();
    });
  });

  it('navigates to Impact Tracker and loads lazy component cleanly', async () => {
    render(<App />);
    const impactTabBtn = screen.getAllByText('Impact Tracker')[0];
    fireEvent.click(impactTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Clean Air Impact Tracker/i)).toBeInTheDocument();
    });
  });

  it('navigates to AI Assistant and loads lazy component cleanly', async () => {
    render(<App />);
    const assistantTabBtn = screen.getAllByText('AI Assistant')[0];
    fireEvent.click(assistantTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/AirAware Clean Air Assistant/i)).toBeInTheDocument();
    });
  });
});
