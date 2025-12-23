import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('should render without errors', () => {
    const { container } = render(<SearchInput />);
    expect(container).toBeInTheDocument();
  });
});
