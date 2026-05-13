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
  lote_id: 'LOT-001-ABC-DEF',
  quantidade_total: 100,
  quantidade_aprovada: 85,
  status: 'em_andamento',
  created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

export const EmAndamento: Story = { args: { triagem } };

export const Aprovado: Story = { 
  args: { 
    triagem: { 
      ...triagem, 
      status: 'aprovado',
      quantidade_aprovada: 100 
    } 
  } 
};

export const Rejeitado: Story = { 
  args: { 
    triagem: { 
      ...triagem, 
      status: 'rejeitado',
      quantidade_aprovada: 10 
    } 
  } 
};

export const Pendente: Story = { 
  args: { 
    triagem: { 
      ...triagem, 
      status: 'pendente',
      quantidade_aprovada: 0 
    } 
  } 
};
