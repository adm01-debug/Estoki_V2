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
