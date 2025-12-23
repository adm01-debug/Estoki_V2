import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WorkflowProgress from './WorkflowProgress';
describe('WorkflowProgress', () => {
  it('should render', () => {
    const { container } = render(<WorkflowProgress currentStep={1} totalSteps={5} />);
    expect(container).toBeInTheDocument();
  });
});
