import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TriagemTimer from './TriagemTimer';

describe('TriagemTimer', () => {
  it('should render without errors', () => {
    const { container } = render(<TriagemTimer />);
    expect(container).toBeInTheDocument();
  });
});
