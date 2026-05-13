import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "./sonner";
import { Button } from "./button";
import { ThemeProvider } from "@/contexts/ThemeContext";

const ToasterDemo = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast("Mensagem padrão")}>
          Toast Simples
        </Button>
        <Button onClick={() => toast.success("Operação concluída com sucesso!")}>
          Toast Sucesso
        </Button>
        <Button onClick={() => toast.error("Ocorreu um erro ao processar.")}>
          Toast Erro
        </Button>
        <Button onClick={() => toast.info("Informação importante sobre o sistema.")}>
          Toast Info
        </Button>
        <Button onClick={() => toast("Evento Agendado", {
          description: "Segunda-feira, 30 de Dezembro às 09:00",
          action: {
            label: "Desfazer",
            onClick: () => console.log("Desfeito"),
          },
        })}>
          Toast com Ação
        </Button>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => <ToasterDemo />,
};