import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import NotificationCenter from './NotificationCenter';
describe('NotificationCenter', () => {
  it('should render', () => {
    const { container } = render(<NotificationCenter />);
    expect(container).toBeInTheDocument();
  });
});
