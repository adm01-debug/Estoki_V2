import type { Meta, StoryObj } from "@storybook/react";
import { NovoRecebimentoDialog } from "./NovoRecebimentoDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta: Meta<typeof NovoRecebimentoDialog> = {
  title: "Recebimento/NovoRecebimentoDialog",
  component: NovoRecebimentoDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NovoRecebimentoDialog>;

export const Default: Story = {
  render: () => (
    <div className="p-4">
      <NovoRecebimentoDialog trigger={<Button>Abrir Novo Recebimento</Button>} />
      <Toaster />
    </div>
  ),
};