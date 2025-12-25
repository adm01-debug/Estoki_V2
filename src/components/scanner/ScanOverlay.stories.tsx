import type { Meta, StoryObj } from '@storybook/react';
import ScanOverlay from './ScanOverlay';

const meta: Meta<typeof ScanOverlay> = {
  title: 'Scanner/ScanOverlay',
  component: ScanOverlay,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
