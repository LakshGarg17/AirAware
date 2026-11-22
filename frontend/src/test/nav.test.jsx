import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';

describe('Navbar Navigation', () => {
  it('renders all tabs and handles click', () => {
    const onSelectTab = vi.fn();
    const onOpenProfile = vi.fn();

    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={onSelectTab}
        currentLocation={{ name: 'Delhi, India' }}
        currentAqiData={{ current_aqi: { aqi: 180, severity_key: 'unhealthy' } }}
        onOpenProfile={onOpenProfile}
      />
    );

    expect(screen.getByText('Smog Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Daily Plan')).toBeInTheDocument();
    expect(screen.getByText('Indoor Air')).toBeInTheDocument();
    expect(screen.getByText('Sustainable Living')).toBeInTheDocument();
    expect(screen.getByText('Impact Tracker')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();

    // Click on Daily Plan
    fireEvent.click(screen.getByText('Daily Plan'));
    expect(onSelectTab).toHaveBeenCalledWith('plan');

    // Click Profile button
    const profileBtn = screen.getByTitle('Edit Profile');
    fireEvent.click(profileBtn);
    expect(onOpenProfile).toHaveBeenCalled();
  });
});
