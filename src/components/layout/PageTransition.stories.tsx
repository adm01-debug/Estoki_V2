import type { Meta, StoryObj } from "@storybook/react";
import { PageTransition } from "./PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

const meta: Meta<typeof PageTransition> = {
  title: "Layout/PageTransition",
  component: PageTransition,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageTransition>;

const Demo = (args: any) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Ocultar" : "Mostrar"}
      </Button>
      <div className="h-40">
        <AnimatePresence mode="wait">
          {isVisible && (
            <PageTransition key="content" {...args}>
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Animado</CardTitle>
                </CardHeader>
                <CardContent>
                  Este componente suaviza a entrada e saída de páginas ou seções do sistema.
                </CardContent>
              </Card>
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
};

export const Scale: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};