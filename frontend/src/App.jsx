import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileDrawer from './components/ProfileDrawer';
import DashboardPage from './pages/DashboardPage';
import { fetchAirQuality } from './api/client';
import { useProfile } from './hooks/useProfile';
import { useImpact } from './hooks/useImpact';

// Lazy-loaded tab views for optimized bundle splitting and faster initial load
const DailyPlanPage = lazy(() => import('./pages/DailyPlanPage'));
const IndoorAirPage = lazy(() => import('./pages/IndoorAirPage'));
const SustainableLivingPage = lazy(() => import('./pages/SustainableLivingPage'));
const ImpactTrackerPage = lazy(() => import('./pages/ImpactTrackerPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));

const DEFAULT_LOCATION = {
  name: 'Delhi, India',
  latitude: 28.6139,
  longitude: 77.2090
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [aqiData, setAqiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hook for stateless browser-stored profile
  const { profile, updateProfile, resetProfile, warnings } = useProfile();

  // Hook for stateless impact tracking
  const { logAction } = useImpact();

  // Load environmental data for the current location with error handling and retry support
  const loadEnvironmentalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAirQuality(
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.name
      );
      setAqiData(data);
    } catch (err) {
      console.error('Failed to fetch air data:', err);
      setError(err.message || 'Failed to load air quality data. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  // Fetch air quality and weather data on location change
  useEffect(() => {
    loadEnvironmentalData();
  }, [loadEnvironmentalData]);

  const handleLocationSelect = (loc) => {
    setCurrentLocation(loc);
  };

  const handleQuickLogImpact = (impactType) => {
    if (impactType) {
      logAction(impactType);
      setActiveTab('impact');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentLocation={currentLocation}
        currentAqiData={aqiData}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-500 font-medium text-xs">Loading section...</p>
          </div>
        }>
          {activeTab === 'dashboard' && (
            <DashboardPage
              aqiData={aqiData}
              currentLocation={currentLocation}
              onLocationSelect={handleLocationSelect}
              isLoading={isLoading}
              error={error}
              onNavigateTab={setActiveTab}
              onOpenProfile={() => setIsProfileOpen(true)}
              profile={profile}
              onRetry={loadEnvironmentalData}
            />
          )}

          {activeTab === 'plan' && (
            <DailyPlanPage 
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              profile={profile}
              onQuickLogImpact={handleQuickLogImpact}
            />
          )}

          {activeTab === 'indoor' && (
            <IndoorAirPage 
              aqiData={aqiData} 
            />
          )}

          {activeTab === 'sustainable' && (
            <SustainableLivingPage 
              profile={profile}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactTrackerPage />
          )}

          {activeTab === 'assistant' && (
            <AIAssistantPage 
              currentAqiData={aqiData}
              currentLocation={currentLocation}
              profile={profile}
            />
          )}
        </Suspense>
      </main>

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        onResetProfile={resetProfile}
        warnings={warnings}
      />

      <Footer />
    </div>
  );
}
