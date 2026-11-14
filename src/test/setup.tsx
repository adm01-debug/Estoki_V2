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
// ProseMirror/Tiptap chama Range/Text.getClientRects ao rolar o editor;
// jsdom implementa a funcao so em Element, e sem o stub o Vitest aborta com
// "unhandled error" (target.getClientRects is not a function) mesmo com todos
// os testes verdes (erro intermitente, depende do scroll da selecao).
const rectStub = () => ({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});
for (const proto of [window.Range?.prototype, window.Text?.prototype]) {
  if (proto && typeof proto.getClientRects !== "function") {
    Object.defineProperty(proto, "getClientRects", {
      writable: true,
      value: vi.fn(() => []),
    });
  }
  if (proto && typeof proto.getBoundingClientRect !== "function") {
    Object.defineProperty(proto, "getBoundingClientRect", {
      writable: true,
      value: vi.fn(rectStub),
    });
  }
}

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
