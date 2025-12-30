import type { Meta, StoryObj } from '@storybook/react';
import { RelatorioCard } from './RelatorioCard';
import { FileText, BarChart, PieChart } from 'lucide-react';

const meta: Meta<typeof RelatorioCard> = {
  title: 'Relatorios/RelatorioCard',
  component: RelatorioCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Relatório de Estoque', icon: <FileText /> } };
export const ComDescricao: Story = { args: { title: 'Curva ABC', description: 'Análise de produtos', icon: <BarChart /> } };
export const ComUltimaExecucao: Story = { args: { title: 'Movimentações', lastRun: new Date(), icon: <PieChart /> } };
