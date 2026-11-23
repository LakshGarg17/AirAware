import { useState } from 'react';
import { storage } from '../storage/localStorageAdapter';
import { validateProfile } from '../api/client';

export function useProfile() {
  const [profile, setProfile] = useState(() => storage.getProfile());
  const [warnings, setWarnings] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);

    // Call backend stateless validate endpoint
    setIsValidating(true);
    try {
      const data = await validateProfile(newProfile);
      setWarnings(data.warnings || []);
      if (data.profile) {
        setProfile(data.profile);
        storage.saveProfile(data.profile);
      }
    } catch (err) {
      console.warn("Backend profile validation unavailable:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const resetProfile = () => {
    const def = storage.resetProfile();
    setProfile(def);
    setWarnings([]);
  };

  return {
    profile,
    updateProfile,
    resetProfile,
    warnings,
    isValidating
  };
}
