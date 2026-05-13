import type { Meta, StoryObj } from "@storybook/react";
import { RegistroCard } from "./RegistroCard";

const meta: Meta<typeof RegistroCard> = {
  title: "Trocas/RegistroCard",
  component: RegistroCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RegistroCard>;

const registroBase = {
  id: "1",
  pedido: "PED-123456",
  produto: "Mochila para Notebook 15.6",
  sku: "MOCH-001-PT",
  quantidade: 1,
  cliente: "João Silva",
  data_abertura: new Date().toISOString(),
  motivo: "defeito" as const,
  tipo: "devolucao" as const,
};

export const Pendente: Story = {
  args: {
    registro: { ...registroBase, status: "aberto" },
    onView: () => alert("Visualizando registro..."),
  },
};

export const EmAnalise: Story = {
  args: {
    registro: { ...registroBase, status: "em_analise", tipo: "troca" as const },
  },
};

export const Finalizado: Story = {
  args: {
    registro: { ...registroBase, status: "finalizado" },
  },
};