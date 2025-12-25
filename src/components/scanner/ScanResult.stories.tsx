import type { Meta, StoryObj } from '@storybook/react';
import ScanResult from './ScanResult';

const meta: Meta<typeof ScanResult> = {
  title: 'Scanner/ScanResult',
  component: ScanResult,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
