import type { Meta, StoryObj } from "@storybook/react";
import { DefeitoHistorico, mockHistoricoDefeitos } from "../DefeitoHistorico";

const meta = {
  title: "Triagem/DefeitoHistorico",
  component: DefeitoHistorico,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DefeitoHistorico>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComRecorrencia: Story = {
  args: {
    sku: "MOCHILA-EXEC-PRETA",
    produto: "Mochila Executiva Premium Preta",
    historico: mockHistoricoDefeitos["MOCHILA-EXEC-PRETA"].historico,
    totalTriagens: mockHistoricoDefeitos["MOCHILA-EXEC-PRETA"].totalTriagens,
    className: "w-[450px]",
  },
};

export const Moderado: Story = {
  args: {
    sku: "CANETA-METAL-PRATA",
    produto: "Caneta Metal Prata",
    historico: mockHistoricoDefeitos["CANETA-METAL-PRATA"].historico,
    totalTriagens: mockHistoricoDefeitos["CANETA-METAL-PRATA"].totalTriagens,
    className: "w-[450px]",
  },
};

export const SemHistorico: Story = {
  args: {
    sku: "NOVO-PRODUTO-001",
    produto: "Novo Produto em Teste",
    historico: [],
    totalTriagens: 0,
    className: "w-[450px]",
  },
};

export const MuitosDefeitos: Story = {
  args: {
    sku: "TENIS-ESPORTIVO-AZUL",
    produto: "Tênis Esportivo Azul",
    totalTriagens: 50,
    className: "w-[450px]",
    historico: [
      {
        tipo: "mancha",
        label: "Mancha",
        emoji: "🟤",
        ocorrencias: 25,
        ultimaOcorrencia: new Date(),
        percentualLotes: 50,
      },
      {
        tipo: "costura",
        label: "Costura",
        emoji: "🧵",
        ocorrencias: 15,
        ultimaOcorrencia: new Date(),
        percentualLotes: 30,
      },
      {
        tipo: "rasgo",
        label: "Rasgo",
        emoji: "✂️",
        ocorrencias: 10,
        ultimaOcorrencia: new Date(),
        percentualLotes: 20,
      },
      {
        tipo: "cor_errada",
        label: "Cor Errada",
        emoji: "🎨",
        ocorrencias: 5,
        ultimaOcorrencia: new Date(),
        percentualLotes: 10,
      },
      {
        tipo: "outro",
        label: "Outros",
        emoji: "📦",
        ocorrencias: 2,
        ultimaOcorrencia: new Date(),
        percentualLotes: 4,
      },
    ],
  },
};

export const Mobile: Story = {
  args: {
    ...ComRecorrencia.args,
    className: "w-[320px]",
  },
};