import type { Meta, StoryObj } from '@storybook/react';
import Achievement from './Achievement';

const meta: Meta<typeof Achievement> = {
  title: 'Gamificacao/Achievement',
  component: Achievement,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
