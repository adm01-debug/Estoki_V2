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
  nf_numero: '123456',
  fornecedor: 'Distribuidora Alpha Ltda',
  status: 'pendente',
  data_prevista: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias no futuro
};

export const Pendente: Story = { args: { recebimento } };

export const EmConferencia: Story = { 
  args: { 
    recebimento: { 
      ...recebimento, 
      status: 'em_conferencia' 
    } 
  } 
};

export const Concluido: Story = { 
  args: { 
    recebimento: { 
      ...recebimento, 
      status: 'concluido' 
    } 
  } 
};
