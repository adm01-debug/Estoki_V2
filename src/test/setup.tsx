import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion to avoid issues with animations in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons using a Proxy to handle any icon name
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (_target, name) => {
      return (props: any) => <div data-testid={`icon-${String(name).toLowerCase()}`} {...props} />;
    }
  });
});

// Mock browser APIs not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
