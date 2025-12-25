import type { Meta, StoryObj } from '@storybook/react';
import PrintLayout from './PrintLayout';

const meta: Meta<typeof PrintLayout> = {
  title: 'Print/PrintLayout',
  component: PrintLayout,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
