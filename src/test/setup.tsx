import "@testing-library/jest-dom";
import { vi } from "vitest";
import type { ComponentProps, ReactNode } from "react";

type MotionDivProps = ComponentProps<"div"> & { children?: ReactNode };
type ChildrenOnlyProps = { children?: ReactNode };

// Mock framer-motion to avoid issues with animations in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: MotionDivProps) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: ChildrenOnlyProps) => <>{children}</>,
}));

// Use the real lucide-react icons in tests. They are lightweight SVG components
// that render fine under jsdom. A previous catch-all Proxy mock returned a
// component for *every* property access — including `then`, which made the mocked
// module namespace look like a never-resolving thenable, so `await import()` hung
// forever and froze every test importing lucide-react. Vitest also cannot
// enumerate a Proxy's named exports (no `ownKeys` trap), so named imports failed
// once the hang was removed. Importing the real module avoids both problems.
vi.mock("lucide-react", async () => {
  const actual = await import("lucide-react");
  return actual;
});

// Mock browser APIs not available in JSDOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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
