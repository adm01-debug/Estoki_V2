import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Wizard } from './Wizard';

describe('Wizard', () => {
  const mockSteps = [
    { title: 'Step 1', content: <div data-testid="content-1">Content 1</div> },
    { title: 'Step 2', content: <div data-testid="content-2">Content 2</div> },
  ];

  it('renders current step content', () => {
    render(<Wizard steps={mockSteps} onComplete={() => {}} />);
    expect(screen.getByTestId('content-1')).toBeInTheDocument();
  });

  it('navigates to next step', () => {
    render(<Wizard steps={mockSteps} onComplete={() => {}} />);
    fireEvent.click(screen.getByText('Próximo'));
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
  });

  it('navigates to previous step', () => {
    render(<Wizard steps={mockSteps} onComplete={() => {}} />);
    fireEvent.click(screen.getByText('Próximo'));
    fireEvent.click(screen.getByText('Anterior'));
    expect(screen.getByTestId('content-1')).toBeInTheDocument();
  });

  it('calls onComplete on the last step', () => {
    const handleComplete = vi.fn();
    render(<Wizard steps={mockSteps} onComplete={handleComplete} />);
    fireEvent.click(screen.getByText('Próximo'));
    fireEvent.click(screen.getByText('Concluir'));
    expect(handleComplete).toHaveBeenCalled();
  });

  it('disables next button if validation fails', () => {
    const stepsWithValidation = [
      { title: 'S1', content: 'C1', validate: () => false },
      { title: 'S2', content: 'C2' },
    ];
    render(<Wizard steps={stepsWithValidation} onComplete={() => {}} />);
    expect(screen.getByText('Próximo')).toBeDisabled();
  });
});
