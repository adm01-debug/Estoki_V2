import type { Meta, StoryObj } from '@storybook/react';
import { PosicaoCard } from './PosicaoCard';

const meta: Meta<typeof PosicaoCard> = {
  title: 'Estoque/PosicaoCard',
  component: PosicaoCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Livre: Story = { args: { codigo: 'A01-01-1', status: 'livre', tipo: 'picking' } };
export const Ocupada: Story = { args: { codigo: 'A01-02-1', status: 'ocupado', tipo: 'pulmao', produto: 'SKU-001' } };
export const Reservada: Story = { args: { codigo: 'B01-01-1', status: 'reservado', tipo: 'blocado' } };
export const Bloqueada: Story = { args: { codigo: 'C01-01-1', status: 'bloqueado', tipo: 'picking', motivo: 'Avaria' } };
