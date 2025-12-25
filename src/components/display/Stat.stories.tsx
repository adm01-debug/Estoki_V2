import type { Meta, StoryObj } from '@storybook/react';
import Stat from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Display/Stat',
  component: Stat,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
