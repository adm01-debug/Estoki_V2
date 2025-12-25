import type { Meta, StoryObj } from '@storybook/react';
import QRScanner from './QRScanner';

const meta: Meta<typeof QRScanner> = {
  title: 'Scanner/QRScanner',
  component: QRScanner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
