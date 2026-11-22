import { useState, useEffect, useCallback } from 'react';
import { storage } from '../storage/localStorageAdapter';

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
        const res = await fetch('/api/impact/catalog');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setCatalog(data);
        }
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
      const res = await fetch('/api/impact/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actions: currentActions,
          timezone: timezone || 'UTC'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
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
      note: note.slice(0, 140)
    };

    const res = storage.logImpactAction(newAction);
    if (!res.success && res.reason === 'double_tap') {
      setToastMessage("Action was recently logged (anti-double-tap safeguard active).");
      setTimeout(() => setToastMessage(null), 3000);
      return false;
    }

    setActions(res.actions);
    setToastMessage(`Logged: ${actDef ? actDef.label : type}`);
    setTimeout(() => setToastMessage(null), 3000);
    return true;
  };

  // Delete action
  const deleteAction = (actionId) => {
    const target = actions.find(a => a.id === actionId);
    if (target) {
      setLastDeleted(target);
      const updated = storage.deleteImpactAction(actionId);
      setActions(updated);
      setToastMessage("Action removed. Click Undo to restore.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Undo delete
  const undoDelete = () => {
    if (lastDeleted) {
      const updated = storage.restoreImpactAction(lastDeleted);
      setActions(updated);
      setLastDeleted(null);
      setToastMessage("Action restored successfully.");
      setTimeout(() => setToastMessage(null), 3000);
    }
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
    toastMessage
  };
}
