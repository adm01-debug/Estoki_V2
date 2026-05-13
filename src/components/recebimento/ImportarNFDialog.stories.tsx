import type { Meta, StoryObj } from "@storybook/react";
import { ImportarNFDialog } from "./ImportarNFDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta: Meta<typeof ImportarNFDialog> = {
  title: "Recebimento/ImportarNFDialog",
  component: ImportarNFDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportarNFDialog>;

export const Default: Story = {
  render: () => (
    <div className="p-4">
      <ImportarNFDialog trigger={<Button>Abrir Importador de NF-e</Button>} />
      <Toaster />
    </div>
  ),
};