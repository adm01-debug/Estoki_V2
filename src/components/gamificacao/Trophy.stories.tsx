import type { Meta, StoryObj } from '@storybook/react';
import Trophy from './Trophy';

const meta: Meta<typeof Trophy> = {
  title: 'Gamificacao/Trophy',
  component: Trophy,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
