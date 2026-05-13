import { describe, it, expect } from 'vitest';
import * as guards from './index';

describe('Guards Index', () => {
  it('exports AuthGuard', () => {
    expect(guards.AuthGuard).toBeDefined();
  });

  it('exports RoleGuard and shortcuts', () => {
    expect(guards.RoleGuard).toBeDefined();
    expect(guards.AdminGuard).toBeDefined();
    expect(guards.SupervisorGuard).toBeDefined();
    expect(guards.OperatorGuard).toBeDefined();
  });

  it('exports PermissionGuard', () => {
    expect(guards.PermissionGuard).toBeDefined();
  });
});
