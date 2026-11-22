import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageManager } from '../storage/localStorageAdapter';

describe('Impact Tracker Logic', () => {
  let storage;

  beforeEach(() => {
    window.localStorage.clear();
    storage = new LocalStorageManager();
  });

  it('de-duplicates quick-log double-taps within 10 seconds', () => {
    const action1 = {
      id: 'act-1',
      type: 'mask_outdoor',
      category: 'exposure_reduction',
      timestamp: new Date().toISOString()
    };
    const res1 = storage.logImpactAction(action1);
    expect(res1.success).toBe(true);
    expect(res1.actions.length).toBe(1);

    // Immediate second click (within 10s)
    const action2 = {
      id: 'act-2',
      type: 'mask_outdoor',
      category: 'exposure_reduction',
      timestamp: new Date().toISOString()
    };
    const res2 = storage.logImpactAction(action2);
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe('double_tap');
    expect(res2.actions.length).toBe(1);
  });

  it('deletes an action properly', () => {
    const action = {
      id: 'act-del',
      type: 'took_public_transit',
      category: 'environmental_contribution',
      timestamp: new Date().toISOString()
    };
    storage.logImpactAction(action);
    expect(storage.getImpactActions().length).toBe(1);

    const updated = storage.deleteImpactAction('act-del');
    expect(updated.length).toBe(0);
    expect(storage.getImpactActions().length).toBe(0);
  });
});
