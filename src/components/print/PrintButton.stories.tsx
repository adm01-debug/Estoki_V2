import type { Meta, StoryObj } from '@storybook/react';
import PrintButton from './PrintButton';

const meta: Meta<typeof PrintButton> = {
  title: 'Print/PrintButton',
  component: PrintButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
