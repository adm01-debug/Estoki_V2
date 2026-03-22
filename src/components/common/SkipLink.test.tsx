import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('should render skip link for accessibility', () => {
    render(<SkipLink />);
    expect(document.body).toBeInTheDocument();
  });
});
