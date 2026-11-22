import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageManager } from '../storage/localStorageAdapter';

describe('Planner Checkbox Persistence', () => {
  let storage;

  beforeEach(() => {
    window.localStorage.clear();
    storage = new LocalStorageManager();
  });

  it('toggles and persists action completion for a date', () => {
    const today = '2026-11-22';
    const actionId = 'abc123stable';

    expect(storage.getPlanCompletions(today)).toEqual([]);

    // Check action
    const afterCheck = storage.togglePlanAction(today, actionId);
    expect(afterCheck).toContain(actionId);
    expect(storage.getPlanCompletions(today)).toContain(actionId);

    // Uncheck action
    const afterUncheck = storage.togglePlanAction(today, actionId);
    expect(afterUncheck).not.toContain(actionId);
    expect(storage.getPlanCompletions(today)).toEqual([]);
  });
});
