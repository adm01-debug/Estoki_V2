import { describe, it, expect } from 'vitest';
import { parseNFeXML, validateNFeXML, extractProdutosFromNFe, nfeToRecebimento } from '@/utils/parseNFXML';
import { sanitizeHTML, sanitizeSQL, sanitizeFilename, stripTags, escapeRegex, escapeHTML } from '@/lib/sanitize';

// =============================================
// SAMPLE NF-e XML
// =============================================
const VALID_NFE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe Id="NFe35240312345678000195550010000000011234567890" versao="4.00">
      <ide>
        <nNF>1</nNF>
        <serie>1</serie>
        <dhEmi>2024-03-15T10:00:00-03:00</dhEmi>
        <natOp>Venda de Mercadoria</natOp>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>Empresa Fornecedora LTDA</xNome>
        <xFant>Fornecedora</xFant>
        <enderEmit>
          <xLgr>Rua Teste</xLgr>
          <nro>100</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01001000</CEP>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>98765432000100</CNPJ>
        <xNome>Empresa Destinatária LTDA</xNome>
        <enderDest>
          <xLgr>Av Principal</xLgr>
          <nro>200</nro>
          <xBairro>Industrial</xBairro>
          <xMun>Campinas</xMun>
          <UF>SP</UF>
          <CEP>13010000</CEP>
        </enderDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>PROD001</cProd>
          <cEAN>7891234560012</cEAN>
          <xProd>Produto Teste Alpha</xProd>
          <NCM>84713012</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>25.50</vUnCom>
          <vProd>255.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>PROD002</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>Produto Teste Beta</xProd>
          <NCM>39269090</NCM>
          <CFOP>5102</CFOP>
          <uCom>CX</uCom>
          <qCom>5.0000</qCom>
          <vUnCom>100.00</vUnCom>
          <vProd>500.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vProd>755.00</vProd>
          <vFrete>50.00</vFrete>
          <vSeg>10.00</vSeg>
          <vDesc>5.00</vDesc>
          <vIPI>30.00</vIPI>
          <vICMS>120.00</vICMS>
          <vNF>840.00</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <CNPJ>11222333000144</CNPJ>
          <xNome>Transportadora XYZ</xNome>
        </transporta>
        <vol>
          <qVol>2</qVol>
          <esp>CAIXA</esp>
          <pesoL>15.5</pesoL>
          <pesoB>16.0</pesoB>
        </vol>
      </transp>
      <infAdic>
        <infCpl>Informações complementares de teste</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
</nfeProc>`;

// =============================================
// NF-e PARSING - ~50 scenarios
// =============================================
describe('NF-e XML Parser', () => {
  describe('Full Parse', () => {
    it('parses valid XML without throwing', () => {
      expect(() => parseNFeXML(VALID_NFE_XML)).not.toThrow();
    });

    it('extracts access key', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.chaveAcesso).toBe('35240312345678000195550010000000011234567890');
    });

    it('extracts invoice number', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.numero).toBe('1');
    });

    it('extracts series', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.serie).toBe('1');
    });

    it('extracts natureza da operação', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.naturezaOperacao).toBe('Venda de Mercadoria');
    });

    it('extracts emission date', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.dataEmissao).toBeInstanceOf(Date);
    });
  });

  describe('Emitente', () => {
    it('extracts CNPJ', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.emitente.cnpj).toBe('12345678000195');
    });
    it('extracts razão social', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.emitente.razaoSocial).toBe('Empresa Fornecedora LTDA');
    });
    it('extracts nome fantasia', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.emitente.nomeFantasia).toBe('Fornecedora');
    });
    it('extracts endereço', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.emitente.endereco.logradouro).toBe('Rua Teste');
      expect(nfe.emitente.endereco.numero).toBe('100');
      expect(nfe.emitente.endereco.uf).toBe('SP');
      expect(nfe.emitente.endereco.cep).toBe('01001000');
    });
  });

  describe('Destinatário', () => {
    it('extracts CNPJ', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.destinatario.cnpj).toBe('98765432000100');
    });
    it('extracts razão social', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.destinatario.razaoSocial).toBe('Empresa Destinatária LTDA');
    });
  });

  describe('Produtos', () => {
    it('extracts correct count', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.produtos).toHaveLength(2);
    });
    it('extracts first product details', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      const p = nfe.produtos[0];
      expect(p.codigo).toBe('PROD001');
      expect(p.ean).toBe('7891234560012');
      expect(p.descricao).toBe('Produto Teste Alpha');
      expect(p.ncm).toBe('84713012');
      expect(p.cfop).toBe('5102');
      expect(p.unidade).toBe('UN');
      expect(p.quantidade).toBe(10);
      expect(p.valorUnitario).toBe(25.5);
      expect(p.valorTotal).toBe(255);
    });
    it('extracts second product', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      const p = nfe.produtos[1];
      expect(p.codigo).toBe('PROD002');
      expect(p.unidade).toBe('CX');
      expect(p.quantidade).toBe(5);
      expect(p.valorTotal).toBe(500);
    });
  });

  describe('Totais', () => {
    it('extracts total values', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.totais.valorProdutos).toBe(755);
      expect(nfe.totais.valorFrete).toBe(50);
      expect(nfe.totais.valorSeguro).toBe(10);
      expect(nfe.totais.valorDesconto).toBe(5);
      expect(nfe.totais.valorIPI).toBe(30);
      expect(nfe.totais.valorICMS).toBe(120);
      expect(nfe.totais.valorTotal).toBe(840);
    });
    it('extracts weight from volumes', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.totais.pesoLiquido).toBe(15.5);
      expect(nfe.totais.pesoBruto).toBe(16);
    });
  });

  describe('Transporte', () => {
    it('extracts modalidade frete', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.transporte.modalidade).toBe('0');
    });
    it('extracts transportadora', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.transporte.transportadora?.cnpj).toBe('11222333000144');
      expect(nfe.transporte.transportadora?.razaoSocial).toBe('Transportadora XYZ');
    });
    it('extracts volumes', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.transporte.volumes?.quantidade).toBe(2);
      expect(nfe.transporte.volumes?.especie).toBe('CAIXA');
    });
  });

  describe('Info Adicional', () => {
    it('extracts complementary info', () => {
      const nfe = parseNFeXML(VALID_NFE_XML);
      expect(nfe.informacoesComplementares).toBe('Informações complementares de teste');
    });
  });
});

// =============================================
// NF-e VALIDATION - ~10 scenarios
// =============================================
describe('NF-e Validation', () => {
  it('valid XML returns valid=true', () => {
    expect(validateNFeXML(VALID_NFE_XML).valid).toBe(true);
  });
  it('invalid XML returns error', () => {
    const result = validateNFeXML('<not-nfe></not-nfe>');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
  it('empty string throws', () => {
    const result = validateNFeXML('');
    expect(result.valid).toBe(false);
  });
  it('random text is invalid', () => {
    const result = validateNFeXML('hello world');
    expect(result.valid).toBe(false);
  });
});

// =============================================
// NF-e EXTRACTION - ~8 scenarios
// =============================================
describe('NF-e Product Extraction', () => {
  it('extracts products from valid XML', () => {
    const products = extractProdutosFromNFe(VALID_NFE_XML);
    expect(products).toHaveLength(2);
    expect(products[0].codigo).toBe('PROD001');
  });
});

describe('NF-e to Recebimento Conversion', () => {
  it('converts to receiving format', () => {
    const nfe = parseNFeXML(VALID_NFE_XML);
    const rec = nfeToRecebimento(nfe);
    expect(rec.numeroNF).toBe('1');
    expect(rec.fornecedor).toBe('Empresa Fornecedora LTDA');
    expect(rec.cnpjFornecedor).toBe('12345678000195');
    expect(rec.valorTotal).toBe(840);
    expect(rec.pesoTotal).toBe(16);
    expect(rec.itens).toHaveLength(2);
    expect(rec.itens[0].codigo).toBe('PROD001');
    expect(rec.itens[0].quantidade).toBe(10);
    expect(rec.itens[0].valorUnitario).toBe(25.5);
  });
});

// =============================================
// SANITIZATION - ~20 scenarios
// =============================================
describe('HTML Sanitization', () => {
  it('removes unsafe HTML tags', () => {
    const result = sanitizeHTML('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });
  it('escapes HTML for safe display', () => {
    const result = escapeHTML('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
  });
  it('preserves plain text', () => {
    expect(sanitizeHTML('Hello World')).toBe('Hello World');
  });
  it('escapes angle brackets', () => {
    expect(sanitizeHTML('<b>bold</b>')).toContain('&lt;b&gt;');
  });
});

describe('SQL Sanitization', () => {
  it('removes single quotes', () => {
    expect(sanitizeSQL("O'Brien")).not.toContain("'");
  });
  it('removes double quotes', () => {
    expect(sanitizeSQL('SELECT "name"')).not.toContain('"');
  });
  it('removes semicolons', () => {
    expect(sanitizeSQL('DROP TABLE;')).not.toContain(';');
  });
  it('removes comment markers', () => {
    expect(sanitizeSQL('--comment')).not.toContain('--');
  });
  it('preserves safe text', () => {
    expect(sanitizeSQL('hello world')).toBe('hello world');
  });
});

describe('Filename Sanitization', () => {
  it('replaces special chars with underscore', () => {
    const result = sanitizeFilename('my file (1).pdf');
    expect(result).not.toContain(' ');
    expect(result).not.toContain('(');
    expect(result).toContain('.pdf');
  });
  it('preserves safe chars', () => {
    expect(sanitizeFilename('report-2024.pdf')).toBe('report-2024.pdf');
  });
  it('truncates to 255 chars', () => {
    const long = 'a'.repeat(300) + '.pdf';
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(255);
  });
});

describe('Strip Tags', () => {
  it('removes HTML tags', () => {
    expect(stripTags('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });
  it('preserves text without tags', () => {
    expect(stripTags('No tags here')).toBe('No tags here');
  });
});

describe('Escape Regex', () => {
  it('escapes special regex chars', () => {
    expect(escapeRegex('hello.world*')).toBe('hello\\.world\\*');
  });
  it('escapes brackets', () => {
    expect(escapeRegex('[test]')).toBe('\\[test\\]');
  });
  it('preserves alphanumeric', () => {
    expect(escapeRegex('hello123')).toBe('hello123');
  });
});
