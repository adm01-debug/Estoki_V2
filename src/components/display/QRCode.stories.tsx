import type { Meta, StoryObj } from '@storybook/react';
import QRCode from './QRCode';

const meta: Meta<typeof QRCode> = {
  title: 'Display/QRCode',
  component: QRCode,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
