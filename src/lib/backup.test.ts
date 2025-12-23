import { describe, it, expect, beforeEach } from 'vitest';
import { backupToLocalStorage, restoreFromLocalStorage, clearBackup } from './backup';

describe('backup', () => {
  beforeEach(() => { localStorage.clear(); });

  it('should backup and restore data', () => {
    const data = { test: 'value' };
    backupToLocalStorage('test', data);
    const restored = restoreFromLocalStorage('test');
    expect(restored).toEqual(data);
  });

  it('should clear backup', () => {
    backupToLocalStorage('clear', { x: 1 });
    clearBackup('clear');
    expect(restoreFromLocalStorage('clear')).toBeNull();
  });
});
