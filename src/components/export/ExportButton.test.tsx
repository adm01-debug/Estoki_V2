import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

describe('ExportButton', () => {
  it('should render export button', () => {
    render(<ExportButton onExport={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
