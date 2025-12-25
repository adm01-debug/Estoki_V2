import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CompanyCard from './CompanyCard';

describe('CompanyCard', () => {
  it('should render without crashing', () => {
    render(<CompanyCard />);
  });

  it('should accept className prop', () => {
    const { container } = render(<CompanyCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<CompanyCard ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should render children when applicable', () => {
    render(<CompanyCard>Test Content</CompanyCard>);
    // Component specific rendering
  });
});
