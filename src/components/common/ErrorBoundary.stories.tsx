import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Common/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const BrokenComponent = () => { throw new Error('Test error'); };

export const Default: Story = {
  args: { children: <div>Normal content</div> },
};

export const WithError: Story = {
  args: { children: <BrokenComponent /> },
};
