import type { Meta, StoryObj } from "@storybook/react";
import { TipoBadge } from "./TipoBadge";

const meta: Meta<typeof TipoBadge> = {
  title: "Trocas/TipoBadge",
  component: TipoBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TipoBadge>;

export const Troca: Story = {
  args: {
    tipo: "troca",
  },
};

export const Devolucao: Story = {
  args: {
    tipo: "devolucao",
  },
};