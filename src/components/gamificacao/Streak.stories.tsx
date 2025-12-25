import type { Meta, StoryObj } from '@storybook/react';
import Streak from './Streak';

const meta: Meta<typeof Streak> = {
  title: 'Gamificacao/Streak',
  component: Streak,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
