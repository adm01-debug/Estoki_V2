import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from './KPICard';
import { Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof KPICard> = {
  title: 'Dashboard/KPICard',
  component: KPICard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Pedidos Hoje', value: '156', icon: Package } };
export const WithTrend: Story = { args: { title: 'Vendas', value: 'R$ 45.678', icon: TrendingUp, trend: 12.5 } };
export const WithAlert: Story = { args: { title: 'Pendências', value: '23', icon: AlertTriangle, alert: true } };
export const WithDescription: Story = { args: { title: 'Tempo Médio', value: '2h 15min', icon: Clock, description: 'Picking + Expedição' } };
