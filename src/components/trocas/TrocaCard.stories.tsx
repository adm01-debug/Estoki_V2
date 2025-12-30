import type { Meta, StoryObj } from '@storybook/react';
import { TrocaCard } from './TrocaCard';

const meta: Meta<typeof TrocaCard> = {
  title: 'Trocas/TrocaCard',
  component: TrocaCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const troca = {
  id: '1',
  pedidoOriginal: 'PED-001',
  motivo: 'Defeito',
  status: 'pendente',
  data: new Date(),
};

export const Default: Story = { args: { troca } };
export const Aprovada: Story = { args: { troca: { ...troca, status: 'aprovada' } } };
export const Recusada: Story = { args: { troca: { ...troca, status: 'recusada' } } };
