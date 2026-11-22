import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIAssistantPage from '../pages/AIAssistantPage';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AI Assistant Page UI', () => {
  const dummyAqi = {
    current_aqi: { aqi: 175, category: 'Unhealthy', severity_key: 'unhealthy' }
  };
  const dummyLoc = { name: 'Delhi, India', latitude: 28.61, longitude: 77.20 };

  it('renders context chip with US AQI and location', () => {
    render(
      <AIAssistantPage 
        currentAqiData={dummyAqi} 
        currentLocation={dummyLoc}
        profile={{}}
      />
    );
    expect(screen.getByText(/US AQI 175/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi, India/i)).toBeInTheDocument();
  });

  it('renders starter questions in empty state', () => {
    render(
      <AIAssistantPage 
        currentAqiData={dummyAqi} 
        currentLocation={dummyLoc}
        profile={{}}
      />
    );
    expect(screen.getByText(/Should I wear an N95 mask/i)).toBeInTheDocument();
  });

  it('disables send button when input is empty or whitespace', () => {
    render(
      <AIAssistantPage 
        currentAqiData={dummyAqi} 
        currentLocation={dummyLoc}
        profile={{}}
      />
    );
    const sendBtn = screen.getByTitle('Send message');
    expect(sendBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Type your clean air/i);
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(sendBtn).toBeDisabled();
  });

  it('shows character counter', () => {
    render(
      <AIAssistantPage 
        currentAqiData={dummyAqi} 
        currentLocation={dummyLoc}
        profile={{}}
      />
    );
    const textarea = screen.getByPlaceholderText(/Type your clean air/i);
    fireEvent.change(textarea, { target: { value: 'Hello AQI' } });
    expect(screen.getByText('9/500')).toBeInTheDocument();
  });
});
