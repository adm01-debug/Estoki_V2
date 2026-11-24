import { describe, it, expect } from "vitest";
import { pedidoFormSchema, podeTransicionar } from "../pedidoFormSchema";

const ITEM = { produto_id: "6f1c1b2e-1111-4a2a-9c3d-8a1b2c3d4e5f", quantidade: 2 };
const VALIDO = { codigo: "PED-1", cliente_nome: "Mercado Central", prioridade: 1, itens: [ITEM] };

describe("podeTransicionar", () => {
  it("permite o fluxo normal do pedido", () => {
    expect(podeTransicionar("pendente", "em_separacao")).toBe(true);
    expect(podeTransicionar("em_separacao", "embalagem")).toBe(true);
    expect(podeTransicionar("embalagem", "aguardando_transporte")).toBe(true);
    expect(podeTransicionar("aguardando_transporte", "enviado")).toBe(true);
  });

  it("permite cancelar antes do envio e voltar uma etapa", () => {
    expect(podeTransicionar("pendente", "cancelado")).toBe(true);
    expect(podeTransicionar("embalagem", "em_separacao")).toBe(true);
  });

  it("bloqueia pular etapas e sair de estados finais", () => {
    expect(podeTransicionar("pendente", "enviado")).toBe(false);
    expect(podeTransicionar("enviado", "pendente")).toBe(false);
    expect(podeTransicionar("cancelado", "pendente")).toBe(false);
    expect(podeTransicionar("status-inexistente", "pendente")).toBe(false);
  });
});

describe("pedidoFormSchema", () => {
  it("aceita um pedido completo e preenche os opcionais", () => {
    const resultado = pedidoFormSchema.safeParse(VALIDO);
    expect(resultado.success).toBe(true);
    expect(resultado.success && resultado.data.observacoes).toBe("");
    expect(resultado.success && resultado.data.data_prometida).toBe("");
  });

  it("exige código e cliente", () => {
    const resultado = pedidoFormSchema.safeParse({ ...VALIDO, codigo: "  ", cliente_nome: "" });
    expect(resultado.success).toBe(false);
    const mensagens = resultado.error?.issues.map((i) => i.message) ?? [];
    expect(mensagens).toContain("Informe o código do pedido");
    expect(mensagens).toContain("Informe o cliente");
  });

  it("recusa pedido sem itens, com quantidade zero e com produto inválido", () => {
    expect(pedidoFormSchema.safeParse({ ...VALIDO, itens: [] }).success).toBe(false);

    const semQuantidade = pedidoFormSchema.safeParse({
      ...VALIDO,
      itens: [{ ...ITEM, quantidade: 0 }],
    });
    expect(semQuantidade.success).toBe(false);
    expect(semQuantidade.error?.issues[0].message).toBe("Quantidade deve ser maior que zero");

    const produtoInvalido = pedidoFormSchema.safeParse({
      ...VALIDO,
      itens: [{ ...ITEM, produto_id: "" }],
    });
    expect(produtoInvalido.success).toBe(false);
  });
});
