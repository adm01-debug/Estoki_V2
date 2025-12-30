import type { Meta, StoryObj } from '@storybook/react';
import { TriagemCard } from './TriagemCard';

const meta: Meta<typeof TriagemCard> = {
  title: 'Triagem/TriagemCard',
  component: TriagemCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const triagem = {
  id: '1',
  lote: 'LOT-001',
  quantidade: 100,
  status: 'em_andamento',
  inicio: new Date(),
};

export const Default: Story = { args: { triagem } };
export const Concluida: Story = { args: { triagem: { ...triagem, status: 'concluida' } } };
export const Pendente: Story = { args: { triagem: { ...triagem, status: 'pendente' } } };
