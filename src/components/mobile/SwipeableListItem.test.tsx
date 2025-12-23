import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SwipeableListItem from './SwipeableListItem';

describe('SwipeableListItem', () => {
  it('should render without errors', () => {
    const { container } = render(<SwipeableListItem />);
    expect(container).toBeInTheDocument();
  });
});
