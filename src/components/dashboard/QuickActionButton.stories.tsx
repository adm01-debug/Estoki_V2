import type { Meta, StoryObj } from '@storybook/react';
import { QuickActionButton } from './QuickActionButton';
import { Plus, Scan, Package, Truck } from 'lucide-react';

const meta: Meta<typeof QuickActionButton> = {
  title: 'Dashboard/QuickActionButton',
  component: QuickActionButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Novo Pedido', icon: Plus, onClick: () => {} } };
export const Scan: Story = { args: { label: 'Escanear', icon: Scan, onClick: () => {} } };
export const AllActions: Story = {
  render: () => (
    <div className="flex gap-2">
      <QuickActionButton label="Novo" icon={Plus} onClick={() => {}} />
      <QuickActionButton label="Scan" icon={Scan} onClick={() => {}} />
      <QuickActionButton label="Receber" icon={Package} onClick={() => {}} />
      <QuickActionButton label="Expedir" icon={Truck} onClick={() => {}} />
    </div>
  ),
};
