import type { Meta, StoryObj } from '@storybook/react';
import PrintPreview from './PrintPreview';

const meta: Meta<typeof PrintPreview> = {
  title: 'Print/PrintPreview',
  component: PrintPreview,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
