import type { Meta, StoryObj } from '@storybook/react';
import { AmostragemAutomatica } from '../AmostragemAutomatica';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof AmostragemAutomatica> = {
  title: 'Triagem/AmostragemAutomatica',
  component: AmostragemAutomatica,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-xl">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    tamanhoLote: { control: { type: 'number', min: 1, max: 10000 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PequenoLote: Story = {
  args: {
    tamanhoLote: 50,
    onConfirmarAmostra: action('onConfirmarAmostra'),
  },
};

export const MedioLote: Story = {
  args: {
    tamanhoLote: 500,
    onConfirmarAmostra: action('onConfirmarAmostra'),
  },
};

export const GrandeLote: Story = {
  args: {
    tamanhoLote: 5000,
    onConfirmarAmostra: action('onConfirmarAmostra'),
  },
};
