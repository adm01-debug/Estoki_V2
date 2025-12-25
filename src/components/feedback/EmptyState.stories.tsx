import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Success: Story = { args: { variant: 'success' } };
export const Error: Story = { args: { variant: 'error' } };
export const Warning: Story = { args: { variant: 'warning' } };
