import type { Meta, StoryObj } from "@storybook/react";
import { AmostragemProgresso } from "../AmostragemProgresso";

const meta = {
  title: "Triagem/AmostragemProgresso",
  component: AmostragemProgresso,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmostragemProgresso>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmAndamento: Story = {
  args: {
    status: "em_andamento",
    itensVerificados: 15,
    tamanhoAmostra: 50,
    defeitosEncontrados: 1,
    criterios: { aceite: 2, rejeite: 3 },
  },
  render: (args) => <div className="w-[450px]"><AmostragemProgresso {...args} /></div>
};

export const NoLimite: Story = {
  args: {
    status: "limite",
    itensVerificados: 35,
    tamanhoAmostra: 50,
    defeitosEncontrados: 2,
    criterios: { aceite: 2, rejeite: 3 },
  },
  render: (args) => <div className="w-[450px]"><AmostragemProgresso {...args} /></div>
};

export const Aprovado: Story = {
  args: {
    status: "aprovado",
    itensVerificados: 50,
    tamanhoAmostra: 50,
    defeitosEncontrados: 1,
    criterios: { aceite: 2, rejeite: 3 },
  },
  render: (args) => <div className="w-[450px]"><AmostragemProgresso {...args} /></div>
};

export const Rejeitado: Story = {
  args: {
    status: "rejeitado",
    itensVerificados: 20,
    tamanhoAmostra: 50,
    defeitosEncontrados: 4,
    criterios: { aceite: 2, rejeite: 3 },
  },
  render: (args) => <div className="w-[450px]"><AmostragemProgresso {...args} /></div>
};