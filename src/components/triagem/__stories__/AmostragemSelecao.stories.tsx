import type { Meta, StoryObj } from "@storybook/react";
import { AmostragemSelecao } from "../AmostragemSelecao";
import { useArgs } from "@storybook/preview-api";
import { TooltipProvider } from "@/components/ui/tooltip";

const meta = {
  title: "Triagem/AmostragemSelecao",
  component: AmostragemSelecao,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-[450px]">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AmostragemSelecao>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tamanhoLote: 500,
    metodoSelecionado: "aql_normal",
    calculos: {
      raizQuadrada: 23,
      aqlNormal: 50,
      aqlRigoroso: 80,
      aqlReduzido: 20,
      faixa: "281 - 500",
      letra: "H",
    },
    tamanhoAmostraSelecionado: 50,
    percentualAmostra: "10.0",
    criterios: { aceite: 3, rejeite: 4 },
    setMetodoSelecionado: (v) => console.log("Método selecionado:", v),
    onConfirmar: () => alert("Confirmado!"),
  },
  render: function Render(args) {
    const [{ metodoSelecionado }, updateArgs] = useArgs();
    
    // Simulando lógica de mudança de método (em uma story real usaríamos o useArgs para mudar o tamanho da amostra também se necessário)
    const handleSetMetodo = (metodo: any) => {
      let novaAmostra = args.tamanhoAmostraSelecionado;
      let novaLetra = args.calculos.letra;
      
      if (metodo === "raiz_quadrada") novaAmostra = args.calculos.raizQuadrada;
      if (metodo === "aql_rigoroso") novaAmostra = args.calculos.aqlRigoroso;
      if (metodo === "aql_reduzido") novaAmostra = args.calculos.aqlReduzido;
      if (metodo === "aql_normal") novaAmostra = args.calculos.aqlNormal;

      updateArgs({ 
        metodoSelecionado: metodo,
        tamanhoAmostraSelecionado: novaAmostra
      });
    };

    return <AmostragemSelecao {...args} metodoSelecionado={metodoSelecionado} setMetodoSelecionado={handleSetMetodo} />;
  }
};

export const LoteGrande: Story = {
  args: {
    ...Default.args,
    tamanhoLote: 5000,
    tamanhoAmostraSelecionado: 200,
    calculos: {
      raizQuadrada: 71,
      aqlNormal: 200,
      aqlRigoroso: 315,
      aqlReduzido: 80,
      faixa: "3201 - 10000",
      letra: "L",
    },
    percentualAmostra: "4.0",
  }
};

export const RaizQuadrada: Story = {
  args: {
    ...Default.args,
    metodoSelecionado: "raiz_quadrada",
    tamanhoAmostraSelecionado: 23,
  }
};