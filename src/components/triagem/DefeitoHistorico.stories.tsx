import type { Meta, StoryObj } from "@storybook/react";
import { DefeitoHistorico, mockHistoricoDefeitos } from "./DefeitoHistorico";

const meta: Meta<typeof DefeitoHistorico> = {
  title: "Triagem/DefeitoHistorico",
  component: DefeitoHistorico,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DefeitoHistorico>;

export const ComRecorrencia: Story = {
  args: {
    sku: "MOCHILA-EXEC-PRETA",
    produto: "Mochila Executiva Premium Preta",
    ...mockHistoricoDefeitos["MOCHILA-EXEC-PRETA"],
  },
};

export const ComVariosDefeitos: Story = {
  args: {
    sku: "CANETA-METAL-PRATA",
    produto: "Caneta de Metal Prateada",
    ...mockHistoricoDefeitos["CANETA-METAL-PRATA"],
  },
};

export const SemHistorico: Story = {
  args: {
    sku: "NOVO-PRODUTO",
    produto: "Produto de Teste",
    historico: [],
    totalTriagens: 0,
  },
};