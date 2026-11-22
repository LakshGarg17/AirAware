/**
 * Robust LocalStorage Adapter with in-memory fallback, versioned schema,
 * error handling, corrupt JSON recovery, and 31-day data retention pruning.
 */
import { StorageAdapter } from './StorageAdapter';

const SCHEMA_VERSION = 1;
const STORAGE_PREFIX = 'airaware_';

const KEYS = {
  VERSION: `${STORAGE_PREFIX}schema_version`,
  PROFILE: `${STORAGE_PREFIX}profile_v${SCHEMA_VERSION}`,
  PLAN: `${STORAGE_PREFIX}plan_completions_v${SCHEMA_VERSION}`,
  IMPACT: `${STORAGE_PREFIX}impact_actions_v${SCHEMA_VERSION}`,
};

export class LocalStorageManager extends StorageAdapter {
  constructor() {
    super();
    this.inMemoryStore = new Map();
    this.isStorageAvailable = this._checkStorageAvailability();
    this._initializeSchema();
    this._pruneStaleData();
  }

  _checkStorageAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__airaware_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  _initializeSchema() {
    try {
      const currentVer = this.getItem(KEYS.VERSION);
      if (!currentVer) {
        this.setItem(KEYS.VERSION, SCHEMA_VERSION);
      }
    } catch (err) {
      console.warn("Storage schema initialization skipped:", err);
    }
  }

  _pruneStaleData() {
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);

      // Prune impact actions
      const actions = this.getImpactActions();
      const freshActions = actions.filter((act) => {
        try {
          return new Date(act.timestamp) >= cutoff;
        } catch {
          return false;
        }
      });
      if (freshActions.length !== actions.length) {
        this.setItem(KEYS.IMPACT, freshActions);
      }

      // Prune plan completions
      const planStore = this.getItem(KEYS.PLAN) || {};
      const freshPlan = {};
      const cutoffStr = cutoff.toISOString().split('T')[0];
      for (const [dateStr, ids] of Object.entries(planStore)) {
        if (dateStr >= cutoffStr) {
          freshPlan[dateStr] = ids;
        }
      }
      this.setItem(KEYS.PLAN, freshPlan);
    } catch (err) {
      console.warn("Error during 31-day data pruning:", err);
    }
  }

  getItem(key) {
    if (!this.isStorageAvailable) {
      return this.inMemoryStore.get(key) || null;
    }
    try {
      const val = window.localStorage.getItem(key);
      if (val === null) return null;
      return JSON.parse(val);
    } catch (err) {
      console.warn(`Corrupt data found in ${key}; resetting to default.`, err);
      this.removeItem(key);
      return null;
    }
  }

  setItem(key, value) {
    if (!this.isStorageAvailable) {
      this.inMemoryStore.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Failed to write to localStorage for ${key}, using in-memory store:`, err);
      this.inMemoryStore.set(key, value);
    }
  }

  removeItem(key) {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`Failed to remove key ${key}:`, err);
      }
    }
    this.inMemoryStore.delete(key);
  }

  clearAllData() {
    this.removeItem(KEYS.PROFILE);
    this.removeItem(KEYS.PLAN);
    this.removeItem(KEYS.IMPACT);
    this.inMemoryStore.clear();
  }

  // Domain helpers: Profile
  getProfile() {
    return this.getItem(KEYS.PROFILE) || {
      routine: "office_worker",
      commute: "public_transport",
      outdoor_activity: "walking",
      household: ["general"],
      indoor: ["ventilation_options"],
      constraints: ["budget_conscious"]
    };
  }

  saveProfile(profile) {
    this.setItem(KEYS.PROFILE, profile);
  }

  resetProfile() {
    this.removeItem(KEYS.PROFILE);
    return this.getProfile();
  }

  // Domain helpers: Plan completions by date (YYYY-MM-DD)
  getPlanCompletions(dateStr) {
    const all = this.getItem(KEYS.PLAN) || {};
    return all[dateStr] || [];
  }

  togglePlanAction(dateStr, actionId) {
    const all = this.getItem(KEYS.PLAN) || {};
    const dateList = all[dateStr] || [];
    let updated;
    if (dateList.includes(actionId)) {
      updated = dateList.filter((id) => id !== actionId);
    } else {
      updated = [...dateList, actionId];
    }
    all[dateStr] = updated;
    this.setItem(KEYS.PLAN, all);
    return updated;
  }

  // Domain helpers: Impact Actions
  getImpactActions() {
    return this.getItem(KEYS.IMPACT) || [];
  }

  logImpactAction(action) {
    const existing = this.getImpactActions();

    // Anti-double-tap defense: ignore if same action logged within 10 seconds
    const nowMs = Date.now();
    const isDoubleTap = existing.some((act) => {
      if (act.type === action.type) {
        const diff = Math.abs(nowMs - new Date(act.timestamp).getTime());
        return diff < 10000; // 10s
      }
      return false;
    });

    if (isDoubleTap) {
      return { success: false, reason: "double_tap", actions: existing };
    }

    const updated = [action, ...existing].slice(0, 500);
    this.setItem(KEYS.IMPACT, updated);
    return { success: true, actions: updated };
  }

  deleteImpactAction(actionId) {
    const existing = this.getImpactActions();
    const updated = existing.filter((act) => act.id !== actionId);
    this.setItem(KEYS.IMPACT, updated);
    return updated;
  }

  restoreImpactAction(action) {
    const existing = this.getImpactActions();
    const updated = [action, ...existing].slice(0, 500);
    this.setItem(KEYS.IMPACT, updated);
    return updated;
  }
}

export const storage = new LocalStorageManager();
