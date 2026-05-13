import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge, UIStatus } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Trocas/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['pendente', 'em_analise', 'autorizado', 'enviado', 'concluido', 'recusado'] as UIStatus[]).map(status => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};

export const Pendente: Story = { args: { status: 'pendente' } };
export const EmAnalise: Story = { args: { status: 'em_analise' } };
export const Autorizado: Story = { args: { status: 'autorizado' } };
export const Enviado: Story = { args: { status: 'enviado' } };
export const Concluido: Story = { args: { status: 'concluido' } };
export const Recusado: Story = { args: { status: 'recusado' } };