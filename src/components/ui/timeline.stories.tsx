import type { Meta, StoryObj } from "@storybook/react";
import { Timeline } from "./timeline";
import { Package, Truck, CheckCircle, Search } from "lucide-react";

const meta: Meta<typeof Timeline> = {
  title: "UI/Timeline",
  component: Timeline,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const items = [
  {
    id: "1",
    title: "Pedido Recebido",
    description: "O pedido #1234 foi recebido no sistema e aguarda triagem.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    status: "completed" as const,
    icon: Package,
    user: "Sistema",
  },
  {
    id: "2",
    title: "Triagem em Andamento",
    description: "O lote está sendo conferido por um operador.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    status: "current" as const,
    icon: Search,
    user: "Ricardo Operador",
  },
  {
    id: "3",
    title: "Separação (Picking)",
    description: "Aguardando conclusão da triagem.",
    status: "pending" as const,
    icon: Truck,
  },
  {
    id: "4",
    title: "Finalizado",
    status: "pending" as const,
    icon: CheckCircle,
  },
];

export const Default: Story = {
  args: {
    items,
  },
};

export const ComErro: Story = {
  args: {
    items: [
      ...items.slice(0, 1),
      {
        id: "error",
        title: "Divergência Encontrada",
        description: "Quantidade física diferente da nota fiscal.",
        timestamp: new Date(),
        status: "error" as const,
      },
      ...items.slice(2),
    ],
  },
};