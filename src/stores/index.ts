// Simple state store without external dependencies
type Listener<T> = (state: T) => void;

export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;
  
  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach(listener => listener(state));
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

// App store
export const appStore = createStore({
  sidebarOpen: true,
  theme: 'light' as 'light' | 'dark',
  loading: false,
});

export default { createStore, appStore };
