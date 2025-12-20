/**
 * Parser de XML de Nota Fiscal Eletrônica (NF-e)
 * Extrai informações relevantes do XML padrão brasileiro
 */

export interface NFeProduto {
  codigo: string;
  ean: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NFeEmitente {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export interface NFeDestinatario {
  cnpj: string;
  razaoSocial: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export interface NFeTransporte {
  modalidade: string;
  transportadora?: {
    cnpj: string;
    razaoSocial: string;
  };
  volumes?: {
    quantidade: number;
    especie: string;
    pesoLiquido: number;
    pesoBruto: number;
  };
}

export interface NFeParsed {
  // Identificação
  chaveAcesso: string;
  numero: string;
  serie: string;
  dataEmissao: Date;
  naturezaOperacao: string;
  
  // Partes
  emitente: NFeEmitente;
  destinatario: NFeDestinatario;
  
  // Produtos
  produtos: NFeProduto[];
  
  // Transporte
  transporte: NFeTransporte;
  
  // Totais
  totais: {
    valorProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    valorIPI: number;
    valorICMS: number;
    valorTotal: number;
    pesoLiquido: number;
    pesoBruto: number;
  };
  
  // Informações adicionais
  informacoesComplementares?: string;
}

function getElementText(parent: Element | Document, tagName: string): string {
  const element = parent.getElementsByTagName(tagName)[0];
  return element?.textContent?.trim() || '';
}

function getElementNumber(parent: Element | Document, tagName: string): number {
  const text = getElementText(parent, tagName);
  return parseFloat(text) || 0;
}

function parseEmitente(emit: Element): NFeEmitente {
  const enderEmit = emit.getElementsByTagName('enderEmit')[0];
  
  return {
    cnpj: getElementText(emit, 'CNPJ'),
    razaoSocial: getElementText(emit, 'xNome'),
    nomeFantasia: getElementText(emit, 'xFant'),
    endereco: {
      logradouro: enderEmit ? getElementText(enderEmit, 'xLgr') : '',
      numero: enderEmit ? getElementText(enderEmit, 'nro') : '',
      bairro: enderEmit ? getElementText(enderEmit, 'xBairro') : '',
      cidade: enderEmit ? getElementText(enderEmit, 'xMun') : '',
      uf: enderEmit ? getElementText(enderEmit, 'UF') : '',
      cep: enderEmit ? getElementText(enderEmit, 'CEP') : '',
    }
  };
}

function parseDestinatario(dest: Element): NFeDestinatario {
  const enderDest = dest.getElementsByTagName('enderDest')[0];
  
  return {
    cnpj: getElementText(dest, 'CNPJ') || getElementText(dest, 'CPF'),
    razaoSocial: getElementText(dest, 'xNome'),
    endereco: {
      logradouro: enderDest ? getElementText(enderDest, 'xLgr') : '',
      numero: enderDest ? getElementText(enderDest, 'nro') : '',
      bairro: enderDest ? getElementText(enderDest, 'xBairro') : '',
      cidade: enderDest ? getElementText(enderDest, 'xMun') : '',
      uf: enderDest ? getElementText(enderDest, 'UF') : '',
      cep: enderDest ? getElementText(enderDest, 'CEP') : '',
    }
  };
}

function parseProdutos(dets: HTMLCollectionOf<Element>): NFeProduto[] {
  const produtos: NFeProduto[] = [];
  
  for (let i = 0; i < dets.length; i++) {
    const det = dets[i];
    const prod = det.getElementsByTagName('prod')[0];
    
    if (prod) {
      produtos.push({
        codigo: getElementText(prod, 'cProd'),
        ean: getElementText(prod, 'cEAN') || getElementText(prod, 'cEANTrib'),
        descricao: getElementText(prod, 'xProd'),
        ncm: getElementText(prod, 'NCM'),
        cfop: getElementText(prod, 'CFOP'),
        unidade: getElementText(prod, 'uCom'),
        quantidade: getElementNumber(prod, 'qCom'),
        valorUnitario: getElementNumber(prod, 'vUnCom'),
        valorTotal: getElementNumber(prod, 'vProd'),
      });
    }
  }
  
  return produtos;
}

function parseTransporte(transp: Element | undefined): NFeTransporte {
  if (!transp) {
    return { modalidade: '9' }; // Sem frete
  }
  
  const transporta = transp.getElementsByTagName('transporta')[0];
  const vol = transp.getElementsByTagName('vol')[0];
  
  return {
    modalidade: getElementText(transp, 'modFrete'),
    transportadora: transporta ? {
      cnpj: getElementText(transporta, 'CNPJ'),
      razaoSocial: getElementText(transporta, 'xNome'),
    } : undefined,
    volumes: vol ? {
      quantidade: getElementNumber(vol, 'qVol'),
      especie: getElementText(vol, 'esp'),
      pesoLiquido: getElementNumber(vol, 'pesoL'),
      pesoBruto: getElementNumber(vol, 'pesoB'),
    } : undefined,
  };
}

function parseTotais(total: Element | undefined): NFeParsed['totais'] {
  if (!total) {
    return {
      valorProdutos: 0,
      valorFrete: 0,
      valorSeguro: 0,
      valorDesconto: 0,
      valorIPI: 0,
      valorICMS: 0,
      valorTotal: 0,
      pesoLiquido: 0,
      pesoBruto: 0,
    };
  }
  
  const icmsTot = total.getElementsByTagName('ICMSTot')[0];
  
  return {
    valorProdutos: icmsTot ? getElementNumber(icmsTot, 'vProd') : 0,
    valorFrete: icmsTot ? getElementNumber(icmsTot, 'vFrete') : 0,
    valorSeguro: icmsTot ? getElementNumber(icmsTot, 'vSeg') : 0,
    valorDesconto: icmsTot ? getElementNumber(icmsTot, 'vDesc') : 0,
    valorIPI: icmsTot ? getElementNumber(icmsTot, 'vIPI') : 0,
    valorICMS: icmsTot ? getElementNumber(icmsTot, 'vICMS') : 0,
    valorTotal: icmsTot ? getElementNumber(icmsTot, 'vNF') : 0,
    pesoLiquido: 0, // Calculado dos volumes
    pesoBruto: 0,
  };
}

/**
 * Parse um arquivo XML de NF-e e retorna os dados estruturados
 */
export function parseNFeXML(xmlString: string): NFeParsed {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Verificar erros de parsing
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('XML inválido: ' + parseError[0].textContent);
  }
  
  // Encontrar o nó principal da NF-e
  const nfe = xmlDoc.getElementsByTagName('NFe')[0] || xmlDoc.getElementsByTagName('nfeProc')[0];
  if (!nfe) {
    throw new Error('XML não contém uma NF-e válida');
  }
  
  const infNFe = nfe.getElementsByTagName('infNFe')[0];
  if (!infNFe) {
    throw new Error('XML não contém informações da NF-e (infNFe)');
  }
  
  // Extrair chave de acesso
  const chaveAcesso = infNFe.getAttribute('Id')?.replace('NFe', '') || '';
  
  // Identificação
  const ide = infNFe.getElementsByTagName('ide')[0];
  const dataEmissaoStr = ide ? getElementText(ide, 'dhEmi') || getElementText(ide, 'dEmi') : '';
  
  // Emitente
  const emit = infNFe.getElementsByTagName('emit')[0];
  if (!emit) {
    throw new Error('XML não contém dados do emitente');
  }
  
  // Destinatário
  const dest = infNFe.getElementsByTagName('dest')[0];
  if (!dest) {
    throw new Error('XML não contém dados do destinatário');
  }
  
  // Produtos
  const dets = infNFe.getElementsByTagName('det');
  
  // Transporte
  const transp = infNFe.getElementsByTagName('transp')[0];
  
  // Totais
  const total = infNFe.getElementsByTagName('total')[0];
  
  // Informações complementares
  const infAdic = infNFe.getElementsByTagName('infAdic')[0];
  const infCpl = infAdic ? getElementText(infAdic, 'infCpl') : '';
  
  const transporte = parseTransporte(transp);
  const totais = parseTotais(total);
  
  // Atualizar peso dos volumes se disponível
  if (transporte.volumes) {
    totais.pesoLiquido = transporte.volumes.pesoLiquido;
    totais.pesoBruto = transporte.volumes.pesoBruto;
  }
  
  return {
    chaveAcesso,
    numero: ide ? getElementText(ide, 'nNF') : '',
    serie: ide ? getElementText(ide, 'serie') : '',
    dataEmissao: dataEmissaoStr ? new Date(dataEmissaoStr) : new Date(),
    naturezaOperacao: ide ? getElementText(ide, 'natOp') : '',
    emitente: parseEmitente(emit),
    destinatario: parseDestinatario(dest),
    produtos: parseProdutos(dets),
    transporte,
    totais,
    informacoesComplementares: infCpl,
  };
}

/**
 * Valida se o XML é uma NF-e válida
 */
export function validateNFeXML(xmlString: string): { valid: boolean; error?: string } {
  try {
    parseNFeXML(xmlString);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Extrai apenas os produtos do XML para importação rápida
 */
export function extractProdutosFromNFe(xmlString: string): NFeProduto[] {
  const nfe = parseNFeXML(xmlString);
  return nfe.produtos;
}

/**
 * Converte dados da NF-e para formato de recebimento
 */
export function nfeToRecebimento(nfe: NFeParsed) {
  return {
    numeroNF: nfe.numero,
    serie: nfe.serie,
    fornecedor: nfe.emitente.razaoSocial,
    cnpjFornecedor: nfe.emitente.cnpj,
    dataEmissao: nfe.dataEmissao,
    valorTotal: nfe.totais.valorTotal,
    pesoTotal: nfe.totais.pesoBruto,
    itens: nfe.produtos.map(p => ({
      codigo: p.codigo,
      ean: p.ean,
      descricao: p.descricao,
      unidade: p.unidade,
      quantidade: p.quantidade,
      valorUnitario: p.valorUnitario,
      valorTotal: p.valorTotal,
    })),
    informacoesAdicionais: nfe.informacoesComplementares,
  };
}
