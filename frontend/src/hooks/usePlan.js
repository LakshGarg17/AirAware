import { useState, useEffect, useCallback } from 'react';
import { storage } from '../storage/localStorageAdapter';
import { generateDailyPlan } from '../api/client';

export function usePlan(latitude, longitude, profile) {
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [variation, setVariation] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const [completedIds, setCompletedIds] = useState(() => storage.getPlanCompletions(todayStr));

  const loadPlan = useCallback(async (varOffset = 0) => {
    if (!latitude || !longitude) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateDailyPlan(latitude, longitude, profile, varOffset);
      setPlanData(data);
    } catch (err) {
      console.error("Failed to load daily plan:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, profile]);

  useEffect(() => {
    loadPlan(variation);
  }, [loadPlan, variation]);

  const toggleAction = (actionId) => {
    const updated = storage.togglePlanAction(todayStr, actionId);
    setCompletedIds(updated);
  };

  const regenerate = () => {
    const nextVar = variation + 1;
    setVariation(nextVar);
  };

  const totalActions = planData?.total_actions || 0;
  const completedCount = completedIds.filter(id => {
    // Only count actions that belong to current plan
    if (!planData?.periods) return false;
    const allPlanIds = [
      ...planData.periods.morning,
      ...planData.periods.afternoon,
      ...planData.periods.evening,
      ...planData.periods.night
    ].map(a => a.id);
    return allPlanIds.includes(id);
  }).length;

  return {
    planData,
    isLoading,
    error,
    completedIds,
    toggleAction,
    regenerate,
    totalActions,
    completedCount,
    reload: () => loadPlan(variation)
  };
}
