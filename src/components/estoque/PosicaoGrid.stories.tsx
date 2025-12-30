import type { Meta, StoryObj } from '@storybook/react';
import { PosicaoGrid } from './PosicaoGrid';

const meta: Meta<typeof PosicaoGrid> = {
  title: 'Estoque/PosicaoGrid',
  component: PosicaoGrid,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const posicoes = [
  { id: '1', codigo: 'A01-01-1', status: 'livre', tipo: 'picking' },
  { id: '2', codigo: 'A01-01-2', status: 'ocupada', tipo: 'pulmao' },
  { id: '3', codigo: 'A01-02-1', status: 'reservada', tipo: 'picking' },
  { id: '4', codigo: 'A01-02-2', status: 'bloqueada', tipo: 'blocado' },
];

export const Default: Story = { args: { posicoes } };
export const Empty: Story = { args: { posicoes: [] } };
export const Loading: Story = { args: { posicoes: [], loading: true } };
