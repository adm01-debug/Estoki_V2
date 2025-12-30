import type { Meta, StoryObj } from '@storybook/react';
import { MenuButton } from './MenuButton';
import { Package, ShoppingCart, Truck, Settings } from 'lucide-react';

const meta: Meta<typeof MenuButton> = {
  title: 'Dashboard/MenuButton',
  component: MenuButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Produtos', icon: Package, onClick: () => {} } };
export const WithBadge: Story = { args: { label: 'Pedidos', icon: ShoppingCart, badge: '12', onClick: () => {} } };
export const Active: Story = { args: { label: 'Expedição', icon: Truck, active: true, onClick: () => {} } };
