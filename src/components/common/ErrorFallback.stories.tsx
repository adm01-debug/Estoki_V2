import type { Meta, StoryObj } from "@storybook/react";
import { ErrorFallback } from "./ErrorFallback";

const meta: Meta<typeof ErrorFallback> = {
  title: "Common/ErrorFallback",
  component: ErrorFallback,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

export const Default: Story = {
  args: {
    error: new Error("Falha ao carregar dados do inventário"),
  },
};

export const GenericError: Story = {
  args: {},
};

export const WithReset: Story = {
  args: {
    error: new Error("Conexão com o servidor perdida"),
    resetErrorBoundary: () => alert("Resetando erro..."),
  },
};