import { describe, it, expect } from 'vitest';
import * as Guards from './index';

describe('Guards Index', () => {
  it('should export AuthGuard', () => {
    expect(Guards.AuthGuard).toBeDefined();
  });

  it('should export RoleGuard', () => {
    expect(Guards.RoleGuard).toBeDefined();
  });

  it('should export PermissionGuard', () => {
    expect(Guards.PermissionGuard).toBeDefined();
  });

  it('should export all guards as named exports', () => {
    const exportedGuards = Object.keys(Guards);
    expect(exportedGuards.length).toBeGreaterThanOrEqual(3);
  });
});
