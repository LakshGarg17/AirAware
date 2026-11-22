import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageManager } from '../storage/localStorageAdapter';

describe('Profile Persistence & Reset', () => {
  let storage;

  beforeEach(() => {
    window.localStorage.clear();
    storage = new LocalStorageManager();
  });

  it('saves and retrieves updated profile', () => {
    const updated = {
      routine: 'work_from_home',
      commute: 'walking',
      outdoor_activity: 'running',
      household: ['children'],
      indoor: ['air_purifier'],
      constraints: ['budget_conscious']
    };
    storage.saveProfile(updated);
    expect(storage.getProfile()).toEqual(updated);
  });

  it('resets profile to defaults', () => {
    storage.saveProfile({ routine: 'student' });
    const def = storage.resetProfile();
    expect(def.routine).toBe('office_worker');
    expect(storage.getProfile().routine).toBe('office_worker');
  });
});
