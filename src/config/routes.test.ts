import { describe, it, expect } from 'vitest';
import { routes, ROUTES } from './routes';

describe('Routes Config', () => {
  const routesConfig = routes || ROUTES;

  it('should be defined', () => {
    expect(routesConfig).toBeDefined();
  });

  it('should have home route', () => {
    expect(routesConfig.HOME || routesConfig.home || routesConfig['/']).toBeDefined();
  });

  it('should have dashboard route', () => {
    expect(routesConfig.DASHBOARD || routesConfig.dashboard).toBeDefined();
  });

  it('should have auth routes', () => {
    expect(routesConfig.LOGIN || routesConfig.login || routesConfig.AUTH).toBeDefined();
  });

  it('should have valid route values', () => {
    Object.values(routesConfig).forEach((route: any) => {
      if (typeof route === 'string') {
        expect(route.startsWith('/')).toBe(true);
      }
    });
  });
});
