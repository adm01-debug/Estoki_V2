import type { Meta, StoryObj } from "@storybook/react";
import { TriagemCard } from "../TriagemCard";

const meta = {
  title: "Triagem/TriagemCard",
  component: TriagemCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TriagemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pendente: Story = {
  args: {
    triagem: {
      lote_id: "LOTE12345678",
      status: "pendente",
      quantidade_total: 100,
      created_at: new Date().toISOString(),
    },
  },
  render: (args) => <div className="w-[300px]"><TriagemCard {...args} /></div>
};

export const EmProcessamento: Story = {
  args: {
    triagem: {
      lote_id: "LOTE87654321",
      status: "em_processamento",
      quantidade_total: 250,
      quantidade_aprovada: 125,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  render: (args) => <div className="w-[300px]"><TriagemCard {...args} /></div>
};

export const Concluido: Story = {
  args: {
    triagem: {
      lote_id: "LOTE99999999",
      status: "concluido",
      quantidade_total: 50,
      quantidade_aprovada: 48,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  render: (args) => <div className="w-[300px]"><TriagemCard {...args} /></div>
};