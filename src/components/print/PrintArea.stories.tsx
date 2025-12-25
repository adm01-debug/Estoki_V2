import type { Meta, StoryObj } from '@storybook/react';
import PrintArea from './PrintArea';

const meta: Meta<typeof PrintArea> = {
  title: 'Print/PrintArea',
  component: PrintArea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
