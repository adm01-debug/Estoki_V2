/**
 * Prompts de IA centralizados.
 *
 * Manter prompts fora do fluxo de request/response facilita revisão,
 * versionamento e ajuste sem tocar no código das funções.
 */

/** Prompt usado pelo scanner-ocr para extrair textos de imagens. */
export const SCANNER_OCR_PROMPT = `Analise esta imagem e extraia TODOS os textos visíveis. 
Se for uma nota fiscal ou documento comercial, identifique:
- Número do documento
- Data
- CNPJ/CPF
- Valores
- Itens/Produtos com quantidades
- Códigos de barras (se visíveis os números)

Responda em JSON válido com a estrutura:
{
  "tipo_documento": "nf" | "etiqueta" | "codigo_barras" | "outro",
  "textos_extraidos": ["texto1", "texto2"],
  "dados_estruturados": {
    "numero_documento": "",
    "data": "",
    "cnpj": "",
    "valor_total": 0,
    "itens": [{"descricao": "", "quantidade": 0, "valor": 0}],
    "codigos": [""]
  },
  "confianca": 0-100
}`;
