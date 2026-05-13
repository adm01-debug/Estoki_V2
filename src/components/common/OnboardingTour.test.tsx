import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingTour } from './OnboardingTour';
import { BrowserRouter } from 'react-router-dom';

// Mock do useLocalStorage
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn((key, initialValue) => {
    let value = initialValue;
    return [value, (newValue: any) => { value = newValue; }];
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('OnboardingTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Fazer Tour" button initially when not completed', () => {
    renderWithRouter(<OnboardingTour />);
    expect(screen.getByText('Fazer Tour')).toBeInTheDocument();
  });

  it('opens the tour when clicking the button', () => {
    renderWithRouter(<OnboardingTour />);
    fireEvent.click(screen.getByText('Fazer Tour'));
    expect(screen.getByText(/🚀 Bem-vindo/)).toBeInTheDocument();
  });

  it('navigates through steps when clicking next', () => {
    renderWithRouter(<OnboardingTour />);
    fireEvent.click(screen.getByText('Fazer Tour'));
    
    const nextButton = screen.getByText(/Próximo/);
    fireEvent.click(nextButton);
    
    expect(screen.getByText(/📊 Dashboard/)).toBeInTheDocument();
  });

  it('closes the tour when clicking the close button', () => {
    renderWithRouter(<OnboardingTour />);
    fireEvent.click(screen.getByText('Fazer Tour'));
    
    const closeButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('button'); // X button
    if (closeButton) fireEvent.click(closeButton);
    
    expect(screen.queryByText(/🚀 Bem-vindo/)).not.toBeInTheDocument();
  });
});
