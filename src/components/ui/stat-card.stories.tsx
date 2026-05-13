import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./stat-card";
import { Package, Users, DollarSign, Activity } from "lucide-react";

const meta: Meta<typeof StatCard> = {
  title: "UI/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: "Total de Pedidos",
    value: "1,234",
    icon: Package,
  },
};

export const WithPositiveTrend: Story = {
  args: {
    title: "Usuários Ativos",
    value: "856",
    icon: Users,
    trend: { value: 12.5, label: "desde ontem" },
  },
};

export const WithNegativeTrend: Story = {
  args: {
    title: "Receita Mensal",
    value: "R$ 45.231,00",
    icon: DollarSign,
    trend: { value: -5.2, label: "vs mês passado" },
  },
};

export const Loading: Story = {
  args: {
    title: "Processamento",
    value: "98%",
    icon: Activity,
    loading: true,
  },
};