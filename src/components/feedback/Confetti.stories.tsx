import type { Meta, StoryObj } from '@storybook/react';
import Confetti from './Confetti';

const meta: Meta<typeof Confetti> = {
  title: 'Feedback/Confetti',
  component: Confetti,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Success: Story = { args: { variant: 'success' } };
export const Error: Story = { args: { variant: 'error' } };
export const Warning: Story = { args: { variant: 'warning' } };
