import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import QuickActionButton from './QuickActionButton';

describe('QuickActionButton', () => {
  it('should render without errors', () => {
    const { container } = render(<QuickActionButton />);
    expect(container).toBeInTheDocument();
  });
});
