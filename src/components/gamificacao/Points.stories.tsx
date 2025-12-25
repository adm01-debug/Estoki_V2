import type { Meta, StoryObj } from '@storybook/react';
import Points from './Points';

const meta: Meta<typeof Points> = {
  title: 'Gamificacao/Points',
  component: Points,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
