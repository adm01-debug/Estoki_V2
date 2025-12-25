import type { Meta, StoryObj } from '@storybook/react';
import Level from './Level';

const meta: Meta<typeof Level> = {
  title: 'Gamificacao/Level',
  component: Level,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
