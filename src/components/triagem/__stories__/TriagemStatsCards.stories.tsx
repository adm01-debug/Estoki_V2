import type { Meta, StoryObj } from "@storybook/react";
import { TriagemStatsCards } from "../formulario/TriagemStatsCards";

const meta = {
  title: "Triagem/Formulario/TriagemStatsCards",
  component: TriagemStatsCards,
  tags: ["autodocs"],
} satisfies Meta<typeof TriagemStatsCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: {
      emAndamento: 5,
      aprovados: 120,
      reprovados: 12,
    },
  },
  render: (args) => <div className="max-w-[800px]"><TriagemStatsCards {...args} /></div>
};

export const InicioDoTurno: Story = {
  args: {
    stats: {
      emAndamento: 2,
      aprovados: 0,
      reprovados: 0,
    },
  },
  render: (args) => <div className="max-w-[800px]"><TriagemStatsCards {...args} /></div>
};

export const GrandeVolume: Story = {
  args: {
    stats: {
      emAndamento: 45,
      aprovados: 1540,
      reprovados: 235,
    },
  },
  render: (args) => <div className="max-w-[800px]"><TriagemStatsCards {...args} /></div>
};