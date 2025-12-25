import type { Meta, StoryObj } from '@storybook/react';
import Treemap from './Treemap';

const meta: Meta<typeof Treemap> = {
  title: 'Charts/Treemap',
  component: Treemap,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 200 },
    ],
  },
};

export const WithCustomColors: Story = {
  args: {
    data: [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
    ],
    colors: ['#8884d8', '#82ca9d'],
  },
};

export const Large: Story = {
  args: {
    data: Array.from({ length: 10 }, (_, i) => ({ name: String.fromCharCode(65 + i), value: Math.random() * 500 })),
    width: 600,
    height: 400,
  },
};
