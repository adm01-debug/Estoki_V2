import type { Meta, StoryObj } from "@storybook/react";
import { AccordionCustom } from "./accordion-custom";

const meta: Meta<typeof AccordionCustom> = {
  title: "UI/AccordionCustom",
  component: AccordionCustom,
  tags: ["autodocs"],
  argTypes: {
    allowMultiple: {
      control: "boolean",
      description: "Permite abrir múltiplos itens simultaneamente",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionCustom>;

const items = [
  {
    id: "item-1",
    title: "O que é o Estoki WMS?",
    content: "O Estoki WMS é um sistema completo de gerenciamento de armazém focado em eficiência e escalabilidade.",
  },
  {
    id: "item-2",
    title: "Como funciona a triagem?",
    content: "A triagem permite classificar produtos recebidos com base em critérios de qualidade e integridade.",
  },
  {
    id: "item-3",
    title: "Suporte a múltiplos depósitos?",
    content: "Sim, o sistema suporta a gestão de múltiplos depósitos e transferências entre eles de forma nativa.",
  },
];

export const Default: Story = {
  args: {
    items,
    allowMultiple: false,
  },
};

export const AllowMultiple: Story = {
  args: {
    items,
    allowMultiple: true,
  },
};