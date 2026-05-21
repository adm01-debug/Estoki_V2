import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests. `motion` is a Proxy
// so any tag (motion.div, motion.span, motion.nav, ...) renders as a passthrough.
const motionProxy = new Proxy(
  {},
  {
    get: (_target, tag) => {
      if (tag === 'then' || typeof tag === 'symbol') return undefined;
      const Tag = String(tag) as keyof JSX.IntrinsicElements;
      return ({ children, ...props }: any) => {
        // Strip framer-only props that are invalid DOM attributes.
        const { initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, layout, ...rest } = props;
        void initial; void animate; void exit; void transition; void variants;
        void whileHover; void whileTap; void whileInView; void layout;
        return <Tag {...rest}>{children}</Tag>;
      };
    },
  }
);

vi.mock('framer-motion', () => ({
  motion: motionProxy,
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
  useScroll: () => ({ scrollY: { get: () => 0, onChange: () => () => {} } }),
}));

// Use the real lucide-react icons. A Proxy mock cannot expose named exports to
// vitest's static import interop, and returning a value for `then` makes the
// module namespace a thenable that deadlocks dynamic import().
vi.mock('lucide-react', async (importOriginal) => {
  return await importOriginal<Record<string, unknown>>();
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
