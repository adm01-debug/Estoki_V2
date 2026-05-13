import type { Meta, StoryObj } from "@storybook/react";
import { FotosLoteObrigatorias } from "./FotosLoteObrigatorias";
import { useState } from "react";
import { type FotoTriagem } from "@/hooks/useTriagemFotos";

const meta: Meta<typeof FotosLoteObrigatorias> = {
  title: "Triagem/FotosLoteObrigatorias",
  component: FotosLoteObrigatorias,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FotosLoteObrigatorias>;

const Demo = (args: any) => {
  const [fotos, setFotos] = useState<FotoTriagem[]>(args.fotos || []);
  const [uploading, setUploading] = useState(false);

  const addFoto = async (file: File, tipo: FotoTriagem['tipo']) => {
    setUploading(true);
    // Simula upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newFoto: FotoTriagem = {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      tipo,
      timestamp: new Date(),
      uploading: false
    };
    setFotos(prev => [...prev, newFoto]);
    setUploading(false);
    return newFoto;
  };

  const removeFoto = (id: string) => {
    setFotos(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FotosLoteObrigatorias
      {...args}
      fotos={fotos}
      uploading={uploading}
      onAddFoto={addFoto}
      onRemoveFoto={removeFoto}
    />
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    minFotos: 2,
  },
};

export const ComFotos: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    minFotos: 2,
    fotos: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop",
        tipo: "geral",
        timestamp: new Date(),
        uploading: false,
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1627634777217-c864268db30c?w=400&h=400&fit=crop",
        tipo: "etiqueta",
        timestamp: new Date(),
        uploading: false,
      },
    ],
  },
};