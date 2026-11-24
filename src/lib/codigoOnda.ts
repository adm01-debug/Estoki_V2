/** Codigo legivel de onda: ON-<ultimos 6 digitos do epoch>-<3 digitos>. */
export function gerarCodigoOnda(
  agora: number = Date.now(),
  random: () => number = Math.random
): string {
  return `ON-${agora.toString().slice(-6)}-${Math.floor(100 + random() * 900)}`;
}
