import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import OnboardingTour from './OnboardingTour';
describe('OnboardingTour', () => {
  it('should render', () => {
    const { container } = render(<OnboardingTour />);
    expect(container).toBeInTheDocument();
  });
});
