import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';
import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Display/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Total Produtos', value: '1,234' } };
export const WithIcon: Story = { args: { title: 'Receita', value: 'R$ 50.000', icon: <DollarSign /> } };
export const WithTrend: Story = { args: { title: 'Usuários', value: '5,678', change: 12.5, icon: <Users /> } };
export const NegativeTrend: Story = { args: { title: 'Devoluções', value: '45', change: -5.2, icon: <Package /> } };
