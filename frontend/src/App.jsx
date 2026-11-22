import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import RoutinesPage from './pages/RoutinesPage';
import HacksPage from './pages/HacksPage';
import AlternativesPage from './pages/AlternativesPage';
import ImpactPage from './pages/ImpactPage';
import AssistantPage from './pages/AssistantPage';
import { fetchAirQuality } from './api/client';

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

  // Fetch air quality and weather data on location change
  useEffect(() => {
    let isCurrent = true;
    async function loadEnvironmentalData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAirQuality(
          currentLocation.latitude,
          currentLocation.longitude,
          currentLocation.name
        );
        if (isCurrent) {
          setAqiData(data);
        }
      } catch (err) {
        console.error('Failed to fetch air data:', err);
        if (isCurrent) {
          setError(err.message || 'Failed to load air quality data. Please check connection.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadEnvironmentalData();
    return () => { isCurrent = false; };
  }, [currentLocation]);

  const handleLocationSelect = (loc) => {
    setCurrentLocation(loc);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentLocation={currentLocation}
        currentAqiData={aqiData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            aqiData={aqiData}
            currentLocation={currentLocation}
            onLocationSelect={handleLocationSelect}
            isLoading={isLoading}
            error={error}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesPage 
            currentAqiData={aqiData} 
          />
        )}

        {activeTab === 'hacks' && (
          <HacksPage 
            currentAqiData={aqiData} 
          />
        )}

        {activeTab === 'alternatives' && (
          <AlternativesPage />
        )}

        {activeTab === 'impact' && (
          <ImpactPage />
        )}

        {activeTab === 'assistant' && (
          <AssistantPage 
            currentAqiData={aqiData} 
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
