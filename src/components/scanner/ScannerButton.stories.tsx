import type { Meta, StoryObj } from '@storybook/react';
import { ScannerButton } from './ScannerButton';

const meta: Meta<typeof ScannerButton> = {
  title: 'Scanner/ScannerButton',
  component: ScannerButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { onScan: () => {} } };
export const WithLabel: Story = { args: { label: 'Escanear Código', onScan: () => {} } };
export const Disabled: Story = { args: { disabled: true, onScan: () => {} } };
