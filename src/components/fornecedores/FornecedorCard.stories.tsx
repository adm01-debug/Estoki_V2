import type { Meta, StoryObj } from '@storybook/react';
import { FornecedorCard } from './FornecedorCard';

const meta: Meta<typeof FornecedorCard> = {
  title: 'Fornecedores/FornecedorCard',
  component: FornecedorCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const fornecedor = {
  id: '1',
  nome: 'Fornecedor ABC',
  cnpj: '12.345.678/0001-90',
  status: 'ativo',
  rating: 4.5,
};

export const Default: Story = { args: { fornecedor } };
export const ComAvaliacao: Story = { args: { fornecedor: { ...fornecedor, rating: 5 } } };
export const Inativo: Story = { args: { fornecedor: { ...fornecedor, status: 'inativo' } } };
