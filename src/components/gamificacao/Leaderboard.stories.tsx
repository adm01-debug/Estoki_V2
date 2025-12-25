import type { Meta, StoryObj } from '@storybook/react';
import Leaderboard from './Leaderboard';

const meta: Meta<typeof Leaderboard> = {
  title: 'Gamificacao/Leaderboard',
  component: Leaderboard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
