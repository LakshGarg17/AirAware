import { useState, useEffect, useCallback } from 'react';
import { storage } from '../storage/localStorageAdapter';
import { fetchImpactCatalog, fetchImpactSummary } from '../api/client';

export function useImpact() {
  const [actions, setActions] = useState(() => storage.getImpactActions());
  const [catalog, setCatalog] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  // 1. Fetch action type catalog
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const data = await fetchImpactCatalog();
        if (isMounted) setCatalog(data);
      } catch (err) {
        console.warn("Failed to load impact catalog:", err);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch stateless summary whenever actions change
  const fetchSummary = useCallback(async (currentActions) => {
    setIsLoading(true);
    try {
      const data = await fetchImpactSummary(currentActions, timezone || 'UTC');
      setSummary(data);
    } catch (err) {
      console.warn("Failed to fetch impact summary:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timezone]);

  useEffect(() => {
    fetchSummary(actions);
  }, [actions, fetchSummary]);

  // Log new action
  const logAction = (type, note = '') => {
    const actDef = catalog.find(c => c.id === type);
    const category = actDef ? actDef.category : 'environmental_contribution';

    const newAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      category,
      timestamp: new Date().toISOString(),
      note: note.trim().slice(0, 140)
    };

    const updated = storage.saveImpactAction(newAction);
    setActions(updated);

    const actionLabel = actDef ? actDef.label : "Action";
    setToastMessage(`Logged: ${actionLabel}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete single action with undo
  const deleteAction = (actionId) => {
    const actionToDelete = actions.find(a => a.id === actionId);
    if (!actionToDelete) return;

    setLastDeleted(actionToDelete);
    const updated = storage.deleteImpactAction(actionId);
    setActions(updated);

    setToastMessage("Action removed.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Undo delete
  const undoDelete = () => {
    if (!lastDeleted) return;
    const updated = storage.saveImpactAction(lastDeleted);
    setActions(updated);
    setLastDeleted(null);
    setToastMessage("Action restored.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset all actions
  const resetAllActions = () => {
    storage.setItem('airaware_impact_actions_v1', []);
    setActions([]);
    setSummary(null);
    setToastMessage("All logged actions deleted.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return {
    actions,
    catalog,
    summary,
    isLoading,
    logAction,
    deleteAction,
    undoDelete,
    lastDeleted,
    resetAllActions,
    toastMessage
  };
}
