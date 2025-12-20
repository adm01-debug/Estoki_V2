/**
 * Utilitários de validação para o sistema ESTOKI
 */

// ============================================
// VALIDAÇÃO DE DOCUMENTOS
// ============================================

/**
 * Valida CPF
 */
export function validarCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  
  const numeros = cpf.replace(/\D/g, '');
  
  if (numeros.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[10])) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;
  
  const numeros = cnpj.replace(/\D/g, '');
  
  if (numeros.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Validação do primeiro dígito verificador
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(numeros[i]) * pesos1[i];
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  if (digito1 !== parseInt(numeros[12])) return false;
  
  // Validação do segundo dígito verificador
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(numeros[i]) * pesos2[i];
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  if (digito2 !== parseInt(numeros[13])) return false;
  
  return true;
}

// ============================================
// VALIDAÇÃO DE CONTATO
// ============================================

/**
 * Valida email
 */
export function validarEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function validarTelefone(telefone: string | null | undefined): boolean {
  if (!telefone) return false;
  const numeros = telefone.replace(/\D/g, '');
  return numeros.length === 10 || numeros.length === 11;
}

/**
 * Valida CEP
 */
export function validarCEP(cep: string | null | undefined): boolean {
  if (!cep) return false;
  const numeros = cep.replace(/\D/g, '');
  return numeros.length === 8;
}

// ============================================
// VALIDAÇÃO DE NÚMEROS
// ============================================

/**
 * Valida se é número positivo
 */
export function validarNumeroPositivo(valor: number | string | null | undefined): boolean {
  if (valor === null || valor === undefined) return false;
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return !isNaN(num) && num > 0;
}

/**
 * Valida se é número não negativo
 */
export function validarNumeroNaoNegativo(valor: number | string | null | undefined): boolean {
  if (valor === null || valor === undefined) return false;
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return !isNaN(num) && num >= 0;
}

/**
 * Valida se é inteiro
 */
export function validarInteiro(valor: number | string | null | undefined): boolean {
  if (valor === null || valor === undefined) return false;
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return !isNaN(num) && Number.isInteger(num);
}

/**
 * Valida se está dentro de um intervalo
 */
export function validarIntervalo(
  valor: number | null | undefined,
  min: number,
  max: number
): boolean {
  if (valor === null || valor === undefined) return false;
  return valor >= min && valor <= max;
}

/**
 * Valida percentual (0-100)
 */
export function validarPercentual(valor: number | null | undefined): boolean {
  return validarIntervalo(valor, 0, 100);
}

// ============================================
// VALIDAÇÃO DE TEXTO
// ============================================

/**
 * Valida se texto não está vazio
 */
export function validarTextoObrigatorio(texto: string | null | undefined): boolean {
  if (!texto) return false;
  return texto.trim().length > 0;
}

/**
 * Valida tamanho mínimo do texto
 */
export function validarTamanhoMinimo(texto: string | null | undefined, minimo: number): boolean {
  if (!texto) return false;
  return texto.trim().length >= minimo;
}

/**
 * Valida tamanho máximo do texto
 */
export function validarTamanhoMaximo(texto: string | null | undefined, maximo: number): boolean {
  if (!texto) return true; // vazio é válido para máximo
  return texto.length <= maximo;
}

/**
 * Valida formato de código de barras EAN-13
 */
export function validarEAN13(codigo: string | null | undefined): boolean {
  if (!codigo) return false;
  const numeros = codigo.replace(/\D/g, '');
  if (numeros.length !== 13) return false;
  
  // Cálculo do dígito verificador
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(numeros[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const digitoCalculado = (10 - (soma % 10)) % 10;
  
  return digitoCalculado === parseInt(numeros[12]);
}

// ============================================
// VALIDAÇÃO DE DATAS
// ============================================

/**
 * Valida se é uma data válida
 */
export function validarData(data: string | Date | null | undefined): boolean {
  if (!data) return false;
  const date = typeof data === 'string' ? new Date(data) : data;
  return !isNaN(date.getTime());
}

/**
 * Valida se data é futura
 */
export function validarDataFutura(data: string | Date | null | undefined): boolean {
  if (!validarData(data)) return false;
  const date = typeof data === 'string' ? new Date(data) : data;
  return date > new Date();
}

/**
 * Valida se data é passada
 */
export function validarDataPassada(data: string | Date | null | undefined): boolean {
  if (!validarData(data)) return false;
  const date = typeof data === 'string' ? new Date(data) : data;
  return date < new Date();
}

/**
 * Valida se data está dentro de um período
 */
export function validarDataNoPeriodo(
  data: string | Date | null | undefined,
  inicio: Date,
  fim: Date
): boolean {
  if (!validarData(data)) return false;
  const date = typeof data === 'string' ? new Date(data) : data;
  return date >= inicio && date <= fim;
}

// ============================================
// VALIDAÇÃO ESPECÍFICA DO ESTOKI
// ============================================

/**
 * Valida código de lote
 */
export function validarCodigoLote(codigo: string | null | undefined): boolean {
  if (!codigo) return false;
  // Aceita alfanumérico com hífen, mínimo 3 caracteres
  const regex = /^[A-Za-z0-9-]{3,}$/;
  return regex.test(codigo);
}

/**
 * Valida posição de estoque (formato: A01-B02-C03)
 */
export function validarPosicaoEstoque(posicao: string | null | undefined): boolean {
  if (!posicao) return false;
  // Formato: Corredor-Prateleira-Posição (ex: A01-B02-C03)
  const regex = /^[A-Za-z]\d{2}(-[A-Za-z]\d{2})*$/;
  return regex.test(posicao);
}

/**
 * Valida quantidade de triagem
 */
export function validarQuantidadeTriagem(
  esperada: number,
  conferida: number,
  tolerancia: number = 0
): { valido: boolean; diferenca: number; percentual: number } {
  const diferenca = conferida - esperada;
  const percentual = esperada > 0 ? (Math.abs(diferenca) / esperada) * 100 : 0;
  const valido = percentual <= tolerancia;
  
  return { valido, diferenca, percentual };
}

/**
 * Valida se checklist está completo
 */
export function validarChecklistCompleto(
  checklist: Record<string, boolean>,
  itensObrigatorios: string[]
): { valido: boolean; faltantes: string[] } {
  const faltantes = itensObrigatorios.filter(item => !checklist[item]);
  return {
    valido: faltantes.length === 0,
    faltantes,
  };
}

// ============================================
// TIPOS DE RESULTADO DE VALIDAÇÃO
// ============================================

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
}

/**
 * Combina múltiplas validações
 */
export function combinarValidacoes(
  ...validacoes: { valido: boolean; erro?: string }[]
): ResultadoValidacao {
  const erros: string[] = [];
  
  for (const v of validacoes) {
    if (!v.valido && v.erro) {
      erros.push(v.erro);
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Cria validação com mensagem de erro
 */
export function criarValidacao(
  condicao: boolean,
  mensagemErro: string
): { valido: boolean; erro?: string } {
  return {
    valido: condicao,
    erro: condicao ? undefined : mensagemErro,
  };
}
