import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageManager } from '../storage/localStorageAdapter';

describe('Storage Layer', () => {
  let storage;

  beforeEach(() => {
    window.localStorage.clear();
    storage = new LocalStorageManager();
  });

  it('recovers from corrupt JSON without crashing', () => {
    window.localStorage.setItem('airaware_profile_v1', '{invalid_json');
    const profile = storage.getProfile();
    // Returns default fallback without throwing
    expect(profile).toBeDefined();
    expect(profile.routine).toBe('office_worker');
  });

  it('falls back to in-memory store when storage is blocked', () => {
    const blockedStorage = new LocalStorageManager();
    blockedStorage.isStorageAvailable = false;

    blockedStorage.setItem('test_key', { hello: 'world' });
    expect(blockedStorage.getItem('test_key')).toEqual({ hello: 'world' });
  });

  it('prunes impact actions older than 31 days', () => {
    const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const freshDate = new Date().toISOString();

    const actions = [
      { id: 'old-1', type: 'mask_outdoor', timestamp: oldDate },
      { id: 'fresh-1', type: 'mask_outdoor', timestamp: freshDate }
    ];
    window.localStorage.setItem('airaware_impact_actions_v1', JSON.stringify(actions));

    // Instantiating triggers _pruneStaleData
    const newStorage = new LocalStorageManager();
    const pruned = newStorage.getImpactActions();
    expect(pruned.length).toBe(1);
    expect(pruned[0].id).toBe('fresh-1');
  });

  it('completely wipes all stored data on clearAllData', () => {
    storage.saveProfile({ routine: 'student' });
    storage.logImpactAction({ id: '1', type: 'mask_outdoor', timestamp: new Date().toISOString() });
    storage.clearAllData();

    expect(storage.getItem('airaware_impact_actions_v1')).toBeNull();
  });
});
