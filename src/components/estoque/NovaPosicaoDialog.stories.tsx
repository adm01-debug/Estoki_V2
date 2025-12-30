import type { Meta, StoryObj } from '@storybook/react';
import { NovaPosicaoDialog } from './NovaPosicaoDialog';

const meta: Meta<typeof NovaPosicaoDialog> = {
  title: 'Estoque/NovaPosicaoDialog',
  component: NovaPosicaoDialog,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { open: true, onClose: () => {}, onSave: () => {} } };
