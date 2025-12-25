import type { Meta, StoryObj } from '@storybook/react';
import PrintHeader from './PrintHeader';

const meta: Meta<typeof PrintHeader> = {
  title: 'Print/PrintHeader',
  component: PrintHeader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
