import type { Meta, StoryObj } from "@storybook/react";
import { ResultadoInspecaoCard } from "./ResultadoInspecaoCard";
import { useState } from "react";

const meta: Meta<typeof ResultadoInspecaoCard> = {
  title: "Triagem/Formulario/ResultadoInspecaoCard",
  component: ResultadoInspecaoCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResultadoInspecaoCard>;

const Demo = (args: any) => {
  const [aprovada, setAprovada] = useState(args.quantidadeAprovada || 0);
  const [reprovada, setReprovada] = useState(args.quantidadeReprovada || 0);
  const [obs, setObs] = useState(args.observacoes || "");

  return (
    <ResultadoInspecaoCard
      {...args}
      quantidadeAprovada={aprovada}
      setQuantidadeAprovada={setAprovada}
      quantidadeReprovada={reprovada}
      setQuantidadeReprovada={setReprovada}
      observacoes={obs}
      setObservacoes={setObs}
    />
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    quantidadeTotal: 100,
    quantidadeAprovada: 0,
    quantidadeReprovada: 0,
    observacoes: "",
  },
};

export const ComValores: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    quantidadeTotal: 50,
    quantidadeAprovada: 45,
    quantidadeReprovada: 5,
    observacoes: "5 unidades com embalagem danificada.",
  },
};