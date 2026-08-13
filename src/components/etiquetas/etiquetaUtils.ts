export function gerarCodigoUnico(prefix: string, id: string): string {
  // Gera um código único baseado no prefixo e nos últimos 6 caracteres do UUID
  return `${prefix}-${id.substring(0, 8).toUpperCase()}`;
}
