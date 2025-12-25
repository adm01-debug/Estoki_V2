import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkipLinks from './SkipLinks';

describe('SkipLinks', () => {
  it('should render skip links', () => {
    render(
      <SkipLinks links={[{ href: '#main', label: 'Skip to main content' }]} />
    );
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should render multiple skip links', () => {
    render(
      <SkipLinks links={[
        { href: '#main', label: 'Skip to main' },
        { href: '#nav', label: 'Skip to navigation' },
      ]} />
    );
    expect(screen.getByText('Skip to main')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(
      <SkipLinks links={[{ href: '#content', label: 'Skip to content' }]} />
    );
    const link = screen.getByText('Skip to content');
    expect(link).toHaveAttribute('href', '#content');
  });

  it('should be visually hidden until focused', () => {
    render(
      <SkipLinks links={[{ href: '#main', label: 'Skip link' }]} />
    );
    const link = screen.getByText('Skip link');
    expect(link.parentElement).toHaveClass('sr-only');
  });
});
