import type { Meta, StoryObj } from '@storybook/react';
import Kbd from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Display/Kbd',
  component: Kbd,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
