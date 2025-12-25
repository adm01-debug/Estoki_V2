import type { Meta, StoryObj } from '@storybook/react';
import Reward from './Reward';

const meta: Meta<typeof Reward> = {
  title: 'Gamificacao/Reward',
  component: Reward,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
