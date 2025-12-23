import { describe, it, expect } from 'vitest';
import { createStore, appStore } from './index';

describe('stores', () => {
  it('should create store with initial state', () => {
    const store = createStore({ count: 0 });
    expect(store.getState().count).toBe(0);
  });

  it('should update state', () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
  });

  it('should have appStore', () => {
    expect(appStore.getState().sidebarOpen).toBe(true);
  });
});
