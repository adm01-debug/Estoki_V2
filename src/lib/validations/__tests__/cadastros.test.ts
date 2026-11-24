import { describe, it, expect } from "vitest";
import {
  armazemSchema,
  categoriaSchema,
  clienteSchema,
  cnpjValido,
  cpfValido,
  documentoValido,
  errosPorCampo,
} from "../cadastros";

const armazemBase = {
  codigo: "ARM-05",
  nome: "CD Recife",
  endereco: "",
  cidade: "",
  estado: "" as const,
  cep: "",
  capacidade_total: 0,
};

const clienteBase = {
  nome: "Cliente Teste",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
};

const categoriaBase = { nome: "Canecas", descricao: "", cor: "#FF6B6B", icone: "Coffee" as const };

describe("cnpjValido / cpfValido", () => {
  it("aceita CNPJ e CPF com dígito verificador correto", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cpfValido("111.444.777-35")).toBe(true);
    expect(documentoValido("529.982.247-25")).toBe(true);
  });

  it("recusa dígito verificador errado, sequência repetida e tamanho inválido", () => {
    expect(cnpjValido("12.345.678/0001-90")).toBe(false);
    expect(cpfValido("123.456.789-00")).toBe(false);
    expect(cpfValido("111.111.111-11")).toBe(false);
    expect(documentoValido("1234567890")).toBe(false);
  });
});

describe("armazemSchema", () => {
  it("aceita armazém válido", () => {
    expect(
      armazemSchema.safeParse({ ...armazemBase, estado: "PE", cep: "50030-230" }).success
    ).toBe(true);
  });

  it("recusa código fora do padrão e capacidade negativa", () => {
    expect(armazemSchema.safeParse({ ...armazemBase, codigo: "arm 05" }).success).toBe(false);
    expect(armazemSchema.safeParse({ ...armazemBase, capacidade_total: -1 }).success).toBe(false);
  });

  it("recusa UF desconhecida e CEP malformado", () => {
    expect(armazemSchema.safeParse({ ...armazemBase, estado: "XX" }).success).toBe(false);
    expect(armazemSchema.safeParse({ ...armazemBase, cep: "5003-23" }).success).toBe(false);
  });
});

describe("clienteSchema", () => {
  it("aceita cadastro sem documento", () => {
    expect(clienteSchema().safeParse(clienteBase).success).toBe(true);
  });

  it("recusa CPF/CNPJ novo com dígito verificador errado", () => {
    const parsed = clienteSchema().safeParse({ ...clienteBase, cpf_cnpj: "12.345.678/0001-90" });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(errosPorCampo(parsed.error).cpf_cnpj).toContain("dígito verificador");
  });

  it("tolerância ao documento legado permite editar o resto do cadastro", () => {
    expect(
      clienteSchema("12.345.678/0001-90").safeParse({
        ...clienteBase,
        cpf_cnpj: "12.345.678/0001-90",
      }).success
    ).toBe(true);
  });

  it("recusa email inválido e UF desconhecida", () => {
    expect(clienteSchema().safeParse({ ...clienteBase, email: "sem-arroba" }).success).toBe(false);
    expect(clienteSchema().safeParse({ ...clienteBase, estado: "ZZ" }).success).toBe(false);
  });

  it("aceita documento novo válido", () => {
    expect(
      clienteSchema().safeParse({ ...clienteBase, cpf_cnpj: "11.222.333/0001-81" }).success
    ).toBe(true);
  });
});

describe("categoriaSchema", () => {
  it("aceita categoria válida", () => {
    expect(categoriaSchema.safeParse(categoriaBase).success).toBe(true);
  });

  it("recusa ícone fora da lista e cor fora do formato", () => {
    expect(categoriaSchema.safeParse({ ...categoriaBase, icone: "IconeInventado" }).success).toBe(
      false
    );
    expect(categoriaSchema.safeParse({ ...categoriaBase, cor: "azul" }).success).toBe(false);
  });
});
