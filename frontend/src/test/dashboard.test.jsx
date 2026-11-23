import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../pages/DashboardPage';

describe('DashboardPage Error and Refresh Functionality', () => {
  const dummyLoc = { name: 'Delhi, India', latitude: 28.61, longitude: 77.20 };

  it('renders error banner with human-readable error message', () => {
    render(
      <DashboardPage
        aqiData={null}
        currentLocation={dummyLoc}
        onLocationSelect={vi.fn()}
        isLoading={false}
        error="API endpoint not found (HTTP 404). Check backend route and VITE_API_BASE_URL."
        onNavigateTab={vi.fn()}
        onOpenProfile={vi.fn()}
        profile={{}}
      />
    );

    expect(screen.getByText(/Unable to refresh air data:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/API endpoint not found \(HTTP 404\)/i)
    ).toBeInTheDocument();
  });

  it('renders Retry button when onRetry prop is provided and triggers callback on click', () => {
    const handleRetry = vi.fn();

    render(
      <DashboardPage
        aqiData={null}
        currentLocation={dummyLoc}
        onLocationSelect={vi.fn()}
        isLoading={false}
        error="Backend service is temporarily unavailable (HTTP 502)."
        onNavigateTab={vi.fn()}
        onOpenProfile={vi.fn()}
        profile={{}}
        onRetry={handleRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    expect(retryBtn).not.toBeDisabled();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('disables Retry button and indicates loading when isLoading is true', () => {
    const handleRetry = vi.fn();

    render(
      <DashboardPage
        aqiData={null}
        currentLocation={dummyLoc}
        onLocationSelect={vi.fn()}
        isLoading={true}
        error="Backend service is temporarily unavailable."
        onNavigateTab={vi.fn()}
        onOpenProfile={vi.fn()}
        profile={{}}
        onRetry={handleRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /retrying.../i });
    expect(retryBtn).toBeInTheDocument();
    expect(retryBtn).toBeDisabled();
  });
});
