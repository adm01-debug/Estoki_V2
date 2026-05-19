import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion to avoid issues with animations in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Package: () => <div data-testid="icon-package" />,
  Eye: () => <div data-testid="icon-eye" />,
  Search: () => <div data-testid="icon-search" />,
  Plus: () => <div data-testid="icon-plus" />,
  Filter: () => <div data-testid="icon-filter" />,
  X: () => <div data-testid="icon-x" />,
  Download: () => <div data-testid="icon-download" />,
}));
