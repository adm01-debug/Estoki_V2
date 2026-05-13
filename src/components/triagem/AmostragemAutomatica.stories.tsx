import type { Meta, StoryObj } from "@storybook/react";
import { AmostragemAutomatica } from "./AmostragemAutomatica";

const meta: Meta<typeof AmostragemAutomatica> = {
  title: "Triagem/AmostragemAutomatica",
  component: AmostragemAutomatica,
  tags: ["autodocs"],
  argTypes: {
    tamanhoLote: {
      control: { type: "number", min: 1, max: 10000 },
      description: "Tamanho total do lote para amostragem",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AmostragemAutomatica>;

export const SelecaoAmostra: Story = {
  args: {
    tamanhoLote: 500,
    onConfirmarAmostra: (tamanho, metodo, criterios) =>
      console.log("Confirmado:", { tamanho, metodo, criterios }),
  },
};

export const EmAndamento: Story = {
  args: {
    tamanhoLote: 500,
    itensVerificados: 25,
    defeitosEncontrados: 1,
    // Simula que o botão de confirmar já foi clicado (o componente lida com isso internamente, mas as props ajudam no estado de progresso)
  },
  render: (args) => {
    // Como o estado de confirmação é interno, para o Storybook mostrar o progresso
    // precisaríamos que o componente aceitasse uma prop de "inicialmenteConfirmado" ou similar.
    // Como não aceita, vamos mostrar a seleção padrão.
    return <AmostragemAutomatica {...args} />;
  },
};