import { z } from "zod";

export const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type UF = (typeof UFS)[number];

export const ICONES_CATEGORIA = [
  "Tag",
  "Coffee",
  "Shirt",
  "Pen",
  "Book",
  "KeyRound",
  "Briefcase",
  "CupSoda",
  "Smartphone",
  "Package",
  "Box",
  "Gift",
  "Palette",
  "Laptop",
  "Home",
] as const;

export type IconeCategoria = (typeof ICONES_CATEGORIA)[number];

const apenasDigitos = (valor: string) => valor.replace(/\D/g, "");

const digitoVerificador = (digitos: string, pesos: number[]): number => {
  const soma = pesos.reduce((total, peso, indice) => total + Number(digitos[indice]) * peso, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

export function cpfValido(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;
  const primeiro = digitoVerificador(digitos, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (primeiro !== Number(digitos[9])) return false;
  const segundo = digitoVerificador(digitos, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return segundo === Number(digitos[10]);
}

export function cnpjValido(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) return false;
  const primeiro = digitoVerificador(digitos, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (primeiro !== Number(digitos[12])) return false;
  const segundo = digitoVerificador(digitos, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return segundo === Number(digitos[13]);
}

export function documentoValido(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 11) return cpfValido(digitos);
  if (digitos.length === 14) return cnpjValido(digitos);
  return false;
}

const textoOpcional = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres`);

const ufOpcional = z.enum(UFS).or(z.literal(""));
const cepOpcional = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido (use 00000-000)")
  .or(z.literal(""));

export const armazemSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "Código obrigatório (mínimo 2 caracteres)")
    .max(20, "Código com no máximo 20 caracteres")
    .regex(/^[A-Z0-9][A-Z0-9-]*$/, "Use maiúsculas, números e hífen (ex.: ARM-01)"),
  nome: z.string().trim().min(2, "Nome obrigatório (mínimo 2 caracteres)").max(120),
  endereco: textoOpcional(200),
  cidade: textoOpcional(80),
  estado: ufOpcional,
  cep: cepOpcional,
  capacidade_total: z
    .number()
    .min(0, "Capacidade não pode ser negativa")
    .max(100000000, "Capacidade acima do limite"),
});

export type ArmazemForm = z.infer<typeof armazemSchema>;

export function clienteSchema(documentoAtual?: string | null) {
  const digitosAtuais = apenasDigitos(documentoAtual ?? "");
  return z
    .object({
      nome: z.string().trim().min(2, "Nome obrigatório (mínimo 2 caracteres)").max(120),
      cpf_cnpj: z.string().trim().max(20, "CPF/CNPJ com no máximo 20 caracteres"),
      email: z
        .string()
        .trim()
        .max(120)
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email inválido")
        .or(z.literal("")),
      telefone: z
        .string()
        .trim()
        .max(20)
        .regex(/^[\d\s()+-]*$/, "Telefone aceita apenas números, espaços, ( ) + -"),
      endereco: textoOpcional(200),
      cidade: textoOpcional(80),
      estado: ufOpcional,
      cep: cepOpcional,
    })
    .refine(
      (dados) =>
        dados.cpf_cnpj === "" ||
        (digitosAtuais !== "" && apenasDigitos(dados.cpf_cnpj) === digitosAtuais) ||
        documentoValido(dados.cpf_cnpj),
      {
        message: "CPF/CNPJ inválido: confira o dígito verificador",
        path: ["cpf_cnpj"],
      }
    );
}

export type ClienteForm = z.infer<ReturnType<typeof clienteSchema>>;

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Nome obrigatório (mínimo 2 caracteres)").max(80),
  descricao: textoOpcional(300),
  cor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato #RRGGBB"),
  icone: z.enum(ICONES_CATEGORIA, { message: "Escolha um ícone da lista" }),
});

export type CategoriaForm = z.infer<typeof categoriaSchema>;

export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "form");
    if (!mapa[campo]) mapa[campo] = problema.message;
  }
  return mapa;
}
