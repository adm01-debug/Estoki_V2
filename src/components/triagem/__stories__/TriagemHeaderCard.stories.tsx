import type { Meta, StoryObj } from "@storybook/react";
import { TriagemHeaderCard } from "../formulario/TriagemHeaderCard";
import { useArgs } from "@storybook/preview-api";

const meta = {
  title: "Triagem/Formulario/TriagemHeaderCard",
  component: TriagemHeaderCard,
  tags: ["autodocs"],
} satisfies Meta<typeof TriagemHeaderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    loteId: "LOTE-2023-001",
    produtoNome: "Mochila Executiva Premium",
    quantidadeTotal: 150,
    formattedTime: "05:23",
    isRunning: true,
  },
  render: function Render(args) {
    const [{ isRunning }, updateArgs] = useArgs();
    
    return (
      <div className="w-[450px]">
        <TriagemHeaderCard 
          {...args} 
          isRunning={isRunning} 
          onPausar={() => updateArgs({ isRunning: false })}
          onIniciar={() => updateArgs({ isRunning: true })}
        />
      </div>
    );
  }
};

export const Pausado: Story = {
  args: {
    ...Default.args,
    isRunning: false,
    formattedTime: "12:45",
  },
  render: (args) => <div className="w-[450px]"><TriagemHeaderCard {...args} /></div>
};

export const LongoPrazo: Story = {
  args: {
    ...Default.args,
    formattedTime: "01:45:20",
    produtoNome: "Mochila Executiva Premium com Compartimento para Notebook de 17 polegadas e Carregador USB",
  },
  render: (args) => <div className="w-[450px]"><TriagemHeaderCard {...args} /></div>
};