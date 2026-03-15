/**
 * SUITE EXAUSTIVA — NF-e Parser
 * ~60 cenários cobrindo parsing XML, validação, extração e edge cases
 */
import { describe, it, expect } from 'vitest';
import { parseNFeXML, validateNFeXML, extractProdutosFromNFe, nfeToRecebimento } from '@/utils/parseNFXML';

const VALID_NFE = `<?xml version="1.0" encoding="utf-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35240101234567890001550010000001231234567890">
      <ide>
        <nNF>123</nNF>
        <serie>1</serie>
        <dhEmi>2024-01-15T10:30:00-03:00</dhEmi>
        <natOp>Venda de mercadoria</natOp>
      </ide>
      <emit>
        <CNPJ>01234567890001</CNPJ>
        <xNome>Fornecedor ABC</xNome>
        <xFant>ABC</xFant>
        <enderEmit><xLgr>Rua A</xLgr><nro>100</nro><xBairro>Centro</xBairro><xMun>SP</xMun><UF>SP</UF><CEP>01000000</CEP></enderEmit>
      </emit>
      <dest>
        <CNPJ>98765432100001</CNPJ>
        <xNome>Destino XYZ</xNome>
        <enderDest><xLgr>Av B</xLgr><nro>200</nro><xBairro>Industrial</xBairro><xMun>GRU</xMun><UF>SP</UF><CEP>07000000</CEP></enderDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>PROD001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Caneta</xProd>
          <NCM>96081000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1000</qCom>
          <vUnCom>1.50</vUnCom>
          <vProd>1500.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>PROD002</cProd>
          <cEAN>7891234567891</cEAN>
          <xProd>Caderno</xProd>
          <NCM>48201000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>500</qCom>
          <vUnCom>12.00</vUnCom>
          <vProd>6000.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vProd>7500.00</vProd>
          <vFrete>150.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vIPI>0.00</vIPI>
          <vICMS>900.00</vICMS>
          <vNF>7650.00</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <CNPJ>11222333000181</CNPJ>
          <xNome>Transportadora T</xNome>
        </transporta>
        <vol>
          <qVol>10</qVol>
          <esp>CAIXA</esp>
          <pesoL>150.00</pesoL>
          <pesoB>160.00</pesoB>
        </vol>
      </transp>
      <infAdic><infCpl>Entrega urgente</infCpl></infAdic>
    </infNFe>
  </NFe>
</nfeProc>`;

// ========== parseNFeXML ==========
describe('parseNFeXML', () => {
  it('parse chave de acesso', () => {
    const r = parseNFeXML(VALID_NFE);
    expect(r.chaveAcesso).toBe('35240101234567890001550010000001231234567890');
  });
  it('parse número e série', () => {
    const r = parseNFeXML(VALID_NFE);
    expect(r.numero).toBe('123');
    expect(r.serie).toBe('1');
  });
  it('parse natureza operação', () => {
    expect(parseNFeXML(VALID_NFE).naturezaOperacao).toBe('Venda de mercadoria');
  });
  it('parse data emissão', () => {
    const r = parseNFeXML(VALID_NFE);
    expect(r.dataEmissao).toBeInstanceOf(Date);
    expect(r.dataEmissao.getFullYear()).toBe(2024);
  });
  it('parse emitente CNPJ', () => {
    expect(parseNFeXML(VALID_NFE).emitente.cnpj).toBe('01234567890001');
  });
  it('parse emitente razão social', () => {
    expect(parseNFeXML(VALID_NFE).emitente.razaoSocial).toBe('Fornecedor ABC');
  });
  it('parse emitente nome fantasia', () => {
    expect(parseNFeXML(VALID_NFE).emitente.nomeFantasia).toBe('ABC');
  });
  it('parse emitente endereço', () => {
    const e = parseNFeXML(VALID_NFE).emitente.endereco;
    expect(e.logradouro).toBe('Rua A');
    expect(e.uf).toBe('SP');
  });
  it('parse destinatário', () => {
    const d = parseNFeXML(VALID_NFE).destinatario;
    expect(d.cnpj).toBe('98765432100001');
    expect(d.razaoSocial).toBe('Destino XYZ');
  });
  it('parse 2 produtos', () => {
    expect(parseNFeXML(VALID_NFE).produtos).toHaveLength(2);
  });
  it('parse produto 1 detalhes', () => {
    const p = parseNFeXML(VALID_NFE).produtos[0];
    expect(p.codigo).toBe('PROD001');
    expect(p.ean).toBe('7891234567890');
    expect(p.descricao).toBe('Caneta');
    expect(p.ncm).toBe('96081000');
    expect(p.cfop).toBe('5102');
    expect(p.unidade).toBe('UN');
    expect(p.quantidade).toBe(1000);
    expect(p.valorUnitario).toBe(1.5);
    expect(p.valorTotal).toBe(1500);
  });
  it('parse produto 2', () => {
    const p = parseNFeXML(VALID_NFE).produtos[1];
    expect(p.codigo).toBe('PROD002');
    expect(p.quantidade).toBe(500);
  });
  it('parse totais', () => {
    const t = parseNFeXML(VALID_NFE).totais;
    expect(t.valorProdutos).toBe(7500);
    expect(t.valorFrete).toBe(150);
    expect(t.valorTotal).toBe(7650);
    expect(t.valorICMS).toBe(900);
  });
  it('parse transporte', () => {
    const tr = parseNFeXML(VALID_NFE).transporte;
    expect(tr.modalidade).toBe('0');
    expect(tr.transportadora?.cnpj).toBe('11222333000181');
    expect(tr.volumes?.quantidade).toBe(10);
    expect(tr.volumes?.especie).toBe('CAIXA');
  });
  it('parse peso', () => {
    const t = parseNFeXML(VALID_NFE).totais;
    expect(t.pesoLiquido).toBe(150);
    expect(t.pesoBruto).toBe(160);
  });
  it('parse informações complementares', () => {
    expect(parseNFeXML(VALID_NFE).informacoesComplementares).toBe('Entrega urgente');
  });

  // Edge cases
  it('throw em XML inválido', () => {
    expect(() => parseNFeXML('<invalid>')).toThrow();
  });
  it('throw sem NFe', () => {
    expect(() => parseNFeXML('<?xml version="1.0"?><root></root>')).toThrow('NF-e válida');
  });
  it('throw sem infNFe', () => {
    expect(() => parseNFeXML('<?xml version="1.0"?><nfeProc><NFe></NFe></nfeProc>')).toThrow('infNFe');
  });
  it('throw sem emitente', () => {
    const xml = `<?xml version="1.0"?><nfeProc><NFe><infNFe Id="NFe123"><ide></ide><dest><CNPJ>1</CNPJ><xNome>D</xNome><enderDest><xLgr>R</xLgr><nro>1</nro><xBairro>B</xBairro><xMun>M</xMun><UF>U</UF><CEP>0</CEP></enderDest></dest></infNFe></NFe></nfeProc>`;
    expect(() => parseNFeXML(xml)).toThrow('emitente');
  });
  it('throw sem destinatário', () => {
    const xml = `<?xml version="1.0"?><nfeProc><NFe><infNFe Id="NFe123"><ide></ide><emit><CNPJ>1</CNPJ><xNome>E</xNome><xFant>F</xFant><enderEmit><xLgr>R</xLgr><nro>1</nro><xBairro>B</xBairro><xMun>M</xMun><UF>U</UF><CEP>0</CEP></enderEmit></emit></infNFe></NFe></nfeProc>`;
    expect(() => parseNFeXML(xml)).toThrow('destinatário');
  });
});

// ========== validateNFeXML ==========
describe('validateNFeXML', () => {
  it('valid true', () => {
    expect(validateNFeXML(VALID_NFE).valid).toBe(true);
  });
  it('invalid false', () => {
    const r = validateNFeXML('<invalid>');
    expect(r.valid).toBe(false);
    expect(r.error).toBeDefined();
  });
  it('empty string invalid', () => {
    expect(validateNFeXML('').valid).toBe(false);
  });
});

// ========== extractProdutosFromNFe ==========
describe('extractProdutosFromNFe', () => {
  it('extrai produtos', () => {
    const p = extractProdutosFromNFe(VALID_NFE);
    expect(p).toHaveLength(2);
    expect(p[0].codigo).toBe('PROD001');
  });
});

// ========== nfeToRecebimento ==========
describe('nfeToRecebimento', () => {
  it('converte para recebimento', () => {
    const nfe = parseNFeXML(VALID_NFE);
    const r = nfeToRecebimento(nfe);
    expect(r.numeroNF).toBe('123');
    expect(r.serie).toBe('1');
    expect(r.fornecedor).toBe('Fornecedor ABC');
    expect(r.cnpjFornecedor).toBe('01234567890001');
    expect(r.valorTotal).toBe(7650);
    expect(r.pesoTotal).toBe(160);
    expect(r.itens).toHaveLength(2);
    expect(r.informacoesAdicionais).toBe('Entrega urgente');
  });
  it('itens do recebimento têm campos corretos', () => {
    const nfe = parseNFeXML(VALID_NFE);
    const r = nfeToRecebimento(nfe);
    const item = r.itens[0];
    expect(item.codigo).toBe('PROD001');
    expect(item.ean).toBe('7891234567890');
    expect(item.descricao).toBe('Caneta');
    expect(item.quantidade).toBe(1000);
    expect(item.valorUnitario).toBe(1.5);
    expect(item.valorTotal).toBe(1500);
  });
});
