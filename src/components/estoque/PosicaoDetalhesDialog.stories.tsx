import type { Meta, StoryObj } from '@storybook/react';
import { PosicaoDetalhesDialog } from './PosicaoDetalhesDialog';

const meta: Meta<typeof PosicaoDetalhesDialog> = {
  title: 'Estoque/PosicaoDetalhesDialog',
  component: PosicaoDetalhesDialog,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const posicao = {
  id: '1',
  codigo: 'A01-01-1',
  status: 'ocupada',
  tipo: 'picking',
  produto: 'SKU-001',
  quantidade: 50,
};

export const Default: Story = { args: { open: true, posicao, onClose: () => {} } };
