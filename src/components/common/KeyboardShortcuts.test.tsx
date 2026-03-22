import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { KeyboardShortcutsHelp } from './KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><KeyboardShortcutsHelp open={true} onOpenChange={vi.fn()} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
