import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InstallPrompt } from './InstallPrompt';

describe('InstallPrompt', () => {
  it('should render without crashing', () => {
    const { container } = render(<InstallPrompt />);
    expect(container).toBeDefined();
  });
});
