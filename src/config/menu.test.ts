import { describe, it, expect } from 'vitest';
import { menu, MENU_ITEMS } from './menu';

describe('Menu Config', () => {
  const menuConfig = menu || MENU_ITEMS;

  it('should be an array', () => {
    expect(Array.isArray(menuConfig)).toBe(true);
  });

  it('should have menu items with required properties', () => {
    if (menuConfig && menuConfig.length > 0) {
      const item = menuConfig[0];
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('path');
    }
  });

  it('should have valid paths', () => {
    if (menuConfig) {
      menuConfig.forEach((item: any) => {
        if (item.path) {
          expect(item.path.startsWith('/')).toBe(true);
        }
      });
    }
  });

  it('should have unique keys or ids', () => {
    if (menuConfig) {
      const keys = menuConfig.map((item: any) => item.key || item.id || item.path);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    }
  });
});
