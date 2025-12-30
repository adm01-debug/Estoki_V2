import type { Meta, StoryObj } from '@storybook/react';
import { RecebimentoCard } from './RecebimentoCard';

const meta: Meta<typeof RecebimentoCard> = {
  title: 'Recebimento/RecebimentoCard',
  component: RecebimentoCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const recebimento = {
  id: '1',
  nf: 'NF-12345',
  fornecedor: 'Fornecedor XYZ',
  itens: 50,
  status: 'em_conferencia',
};

export const Default: Story = { args: { recebimento } };
export const Concluido: Story = { args: { recebimento: { ...recebimento, status: 'concluido' } } };
