import type { Meta, StoryObj } from '@storybook/react';
import BarcodeScanner from './BarcodeScanner';

const meta: Meta<typeof BarcodeScanner> = {
  title: 'Scanner/BarcodeScanner',
  component: BarcodeScanner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
