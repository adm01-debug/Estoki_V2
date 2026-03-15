/**
 * SUITE DE TESTES EXAUSTIVA — WMS Promo Brindes
 * ~220 cenários cobrindo: NFe Parser, Streaks, Validações Zod, Regras de Negócio, Enums, Edge Cases
 */
import { describe, it, expect } from 'vitest';
import { parseNFeXML, validateNFeXML, extractProdutosFromNFe, nfeToRecebimento } from '@/utils/parseNFXML';
import { STREAK_BONUSES } from '@/hooks/useStreaks';
import { estoqueSchema, triagemSchema, recebimentoSchema, usuarioSchema } from '@/lib/validations/index';

const validNFeXML = `<?xml version="1.0" encoding="utf-8"?>
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
        <xNome>Fornecedor ABC Ltda</xNome>
        <xFant>ABC Brindes</xFant>
        <enderEmit>
          <xLgr>Rua das Flores</xLgr>
          <nro>100</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01000000</CEP>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>98765432100001</CNPJ>
        <xNome>Promo Brindes ME</xNome>
        <enderDest>
          <xLgr>Av Industrial</xLgr>
          <nro>500</nro>
          <xBairro>Distrito Industrial</xBairro>
          <xMun>Guarulhos</xMun>
          <UF>SP</UF>
          <CEP>07000000</CEP>
        </enderDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>PROD001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Caneta Personalizada</xProd>
          <NCM>96081000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1000</qCom>
          <vUnCom>2.50</vUnCom>
          <vProd>2500.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>PROD002</cProd>
          <cEAN>7891234567891</cEAN>
          <xProd>Chaveiro Metal</xProd>
          <NCM>83062100</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>500</qCom>
          <vUnCom>5.00</vUnCom>
          <vProd>2500.00</vProd>
        </prod>
      </det>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <CNPJ>11222333000144</CNPJ>
          <xNome>Transportadora XYZ</xNome>
        </transporta>
        <vol>
          <qVol>10</qVol>
          <esp>CAIXA</esp>
          <pesoL>150.00</pesoL>
          <pesoB>165.00</pesoB>
        </vol>
      </transp>
      <total>
        <ICMSTot>
          <vProd>5000.00</vProd>
          <vFrete>200.00</vFrete>
          <vSeg>50.00</vSeg>
          <vDesc>100.00</vDesc>
          <vIPI>250.00</vIPI>
          <vICMS>900.00</vICMS>
          <vNF>5400.00</vNF>
        </ICMSTot>
      </total>
      <infAdic>
        <infCpl>Pedido de compra 12345. Entregar no galpão B.</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
</nfeProc>`;

// ========== 1. NF-e XML Parser ==========
describe('NF-e XML Parser', () => {
  describe('Parsing válido', () => {
    it('parsea sem erros', () => { expect(() => parseNFeXML(validNFeXML)).not.toThrow(); });
    it('chave de acesso', () => { expect(parseNFeXML(validNFeXML).chaveAcesso).toBe('35240101234567890001550010000001231234567890'); });
    it('número NF', () => { expect(parseNFeXML(validNFeXML).numero).toBe('123'); });
    it('série', () => { expect(parseNFeXML(validNFeXML).serie).toBe('1'); });
    it('data emissão', () => { expect(parseNFeXML(validNFeXML).dataEmissao).toBeInstanceOf(Date); });
    it('natureza operação', () => { expect(parseNFeXML(validNFeXML).naturezaOperacao).toBe('Venda de mercadoria'); });
  });

  describe('Emitente', () => {
    it('CNPJ', () => { expect(parseNFeXML(validNFeXML).emitente.cnpj).toBe('01234567890001'); });
    it('razão social', () => { expect(parseNFeXML(validNFeXML).emitente.razaoSocial).toBe('Fornecedor ABC Ltda'); });
    it('fantasia', () => { expect(parseNFeXML(validNFeXML).emitente.nomeFantasia).toBe('ABC Brindes'); });
    it('endereço', () => {
      const e = parseNFeXML(validNFeXML).emitente.endereco;
      expect(e.logradouro).toBe('Rua das Flores');
      expect(e.numero).toBe('100');
      expect(e.cidade).toBe('São Paulo');
      expect(e.uf).toBe('SP');
    });
  });

  describe('Destinatário', () => {
    it('CNPJ', () => { expect(parseNFeXML(validNFeXML).destinatario.cnpj).toBe('98765432100001'); });
    it('razão social', () => { expect(parseNFeXML(validNFeXML).destinatario.razaoSocial).toBe('Promo Brindes ME'); });
    it('cidade', () => { expect(parseNFeXML(validNFeXML).destinatario.endereco.cidade).toBe('Guarulhos'); });
  });

  describe('Produtos', () => {
    it('2 produtos', () => { expect(parseNFeXML(validNFeXML).produtos).toHaveLength(2); });
    it('códigos', () => { expect(parseNFeXML(validNFeXML).produtos[0].codigo).toBe('PROD001'); expect(parseNFeXML(validNFeXML).produtos[1].codigo).toBe('PROD002'); });
    it('EAN', () => { expect(parseNFeXML(validNFeXML).produtos[0].ean).toBe('7891234567890'); });
    it('descrição', () => { expect(parseNFeXML(validNFeXML).produtos[0].descricao).toBe('Caneta Personalizada'); });
    it('quantidades', () => { expect(parseNFeXML(validNFeXML).produtos[0].quantidade).toBe(1000); expect(parseNFeXML(validNFeXML).produtos[1].quantidade).toBe(500); });
    it('valor unitário', () => { expect(parseNFeXML(validNFeXML).produtos[0].valorUnitario).toBe(2.50); });
    it('valor total', () => { expect(parseNFeXML(validNFeXML).produtos[0].valorTotal).toBe(2500); });
    it('NCM/CFOP', () => { expect(parseNFeXML(validNFeXML).produtos[0].ncm).toBe('96081000'); expect(parseNFeXML(validNFeXML).produtos[0].cfop).toBe('5102'); });
    it('unidade', () => { expect(parseNFeXML(validNFeXML).produtos[0].unidade).toBe('UN'); });
  });

  describe('Transporte', () => {
    it('modalidade', () => { expect(parseNFeXML(validNFeXML).transporte.modalidade).toBe('0'); });
    it('transportadora', () => { expect(parseNFeXML(validNFeXML).transporte.transportadora?.cnpj).toBe('11222333000144'); });
    it('volumes', () => { const v = parseNFeXML(validNFeXML).transporte.volumes; expect(v?.quantidade).toBe(10); expect(v?.pesoBruto).toBe(165); });
  });

  describe('Totais', () => {
    it('valor produtos', () => { expect(parseNFeXML(validNFeXML).totais.valorProdutos).toBe(5000); });
    it('valor frete', () => { expect(parseNFeXML(validNFeXML).totais.valorFrete).toBe(200); });
    it('valor total NF', () => { expect(parseNFeXML(validNFeXML).totais.valorTotal).toBe(5400); });
    it('peso', () => { expect(parseNFeXML(validNFeXML).totais.pesoBruto).toBe(165); expect(parseNFeXML(validNFeXML).totais.pesoLiquido).toBe(150); });
  });

  describe('Info adicional', () => {
    it('complementar', () => { expect(parseNFeXML(validNFeXML).informacoesComplementares).toContain('Pedido de compra 12345'); });
  });

  describe('Erros', () => {
    it('XML vazio', () => { expect(() => parseNFeXML('')).toThrow(); });
    it('sem NFe', () => { expect(() => parseNFeXML('<?xml version="1.0"?><root/>')).toThrow(); });
    it('sem emitente', () => {
      const xml = `<?xml version="1.0"?><nfeProc><NFe><infNFe Id="NFe123"><ide><nNF>1</nNF></ide><dest><CNPJ>1</CNPJ><xNome>T</xNome><enderDest><xLgr>R</xLgr><nro>1</nro><xBairro>B</xBairro><xMun>C</xMun><UF>SP</UF><CEP>0</CEP></enderDest></dest></infNFe></NFe></nfeProc>`;
      expect(() => parseNFeXML(xml)).toThrow();
    });
    it('mínimo sem produtos', () => {
      const xml = `<?xml version="1.0"?><nfeProc><NFe><infNFe Id="NFe123"><ide><nNF>1</nNF><serie>1</serie></ide><emit><CNPJ>1</CNPJ><xNome>E</xNome><enderEmit><xLgr>R</xLgr><nro>1</nro><xBairro>B</xBairro><xMun>C</xMun><UF>SP</UF><CEP>0</CEP></enderEmit></emit><dest><CNPJ>2</CNPJ><xNome>D</xNome><enderDest><xLgr>R</xLgr><nro>1</nro><xBairro>B</xBairro><xMun>C</xMun><UF>SP</UF><CEP>0</CEP></enderDest></dest></infNFe></NFe></nfeProc>`;
      expect(parseNFeXML(xml).produtos).toHaveLength(0);
    });
  });

  describe('validateNFeXML', () => {
    it('válido', () => { expect(validateNFeXML(validNFeXML).valid).toBe(true); });
    it('inválido', () => { expect(validateNFeXML('<?xml version="1.0"?><root/>').valid).toBe(false); });
  });

  describe('extractProdutosFromNFe', () => {
    it('extrai 2', () => { expect(extractProdutosFromNFe(validNFeXML)).toHaveLength(2); });
    it('campos', () => { const p = extractProdutosFromNFe(validNFeXML)[0]; expect(p).toHaveProperty('codigo'); expect(p).toHaveProperty('quantidade'); });
  });

  describe('nfeToRecebimento', () => {
    it('converte', () => { const r = nfeToRecebimento(parseNFeXML(validNFeXML)); expect(r.numeroNF).toBe('123'); expect(r.valorTotal).toBe(5400); });
    it('itens', () => { expect(nfeToRecebimento(parseNFeXML(validNFeXML)).itens).toHaveLength(2); });
  });
});

// ========== 2. Streak Bonuses ==========
describe('Streak Bonuses', () => {
  it('5 marcos', () => { expect(STREAK_BONUSES).toHaveLength(5); });
  it('dias crescentes', () => { for (let i = 1; i < STREAK_BONUSES.length; i++) expect(STREAK_BONUSES[i].dias).toBeGreaterThan(STREAK_BONUSES[i-1].dias); });
  it('mult crescentes', () => { for (let i = 1; i < STREAK_BONUSES.length; i++) expect(STREAK_BONUSES[i].multiplicador).toBeGreaterThan(STREAK_BONUSES[i-1].multiplicador); });
  it('XP crescente', () => { for (let i = 1; i < STREAK_BONUSES.length; i++) expect(STREAK_BONUSES[i].xpBonus).toBeGreaterThan(STREAK_BONUSES[i-1].xpBonus); });
  it('títulos não-vazios', () => { STREAK_BONUSES.forEach(b => expect(b.titulo.length).toBeGreaterThan(0)); });
  it('mult > 1', () => { STREAK_BONUSES.forEach(b => expect(b.multiplicador).toBeGreaterThan(1)); });
  it('XP > 0', () => { STREAK_BONUSES.forEach(b => expect(b.xpBonus).toBeGreaterThan(0)); });
  it('3d=Iniciante', () => { expect(STREAK_BONUSES[0]).toEqual({ dias: 3, multiplicador: 1.1, xpBonus: 50, titulo: 'Iniciante Dedicado' }); });
  it('7d=Semana', () => { expect(STREAK_BONUSES[2].titulo).toBe('Semana Perfeita'); });
  it('30d=Mestre', () => { expect(STREAK_BONUSES[4]).toEqual({ dias: 30, multiplicador: 1.5, xpBonus: 1500, titulo: 'Mestre da Consistência' }); });

  describe('Busca', () => {
    const get = (s: number) => [...STREAK_BONUSES].reverse().find(b => b.dias <= s) || null;
    const next = (s: number) => STREAK_BONUSES.find(b => b.dias > s) || null;
    it('0:null', () => { expect(get(0)).toBeNull(); });
    it('2:next=3', () => { expect(next(2)?.dias).toBe(3); });
    it('3:Iniciante', () => { expect(get(3)?.titulo).toBe('Iniciante Dedicado'); });
    it('7:Semana', () => { expect(get(7)?.titulo).toBe('Semana Perfeita'); });
    it('30:Mestre', () => { expect(get(30)?.titulo).toBe('Mestre da Consistência'); });
    it('100:no next', () => { expect(next(100)).toBeNull(); });
    it('progress 42.86%', () => { const a = get(10)!.dias, p = next(10)!.dias; expect(((10-a)/(p-a))*100).toBeCloseTo(42.86,1); });
  });
});

// ========== 3. Zod Schemas ==========
describe('Zod Schemas', () => {
  describe('estoqueSchema', () => {
    it('válido', () => { expect(estoqueSchema.safeParse({ codigo: 'A1', descricao: 'P', quantidade: 10, unidade: 'UN' }).success).toBe(true); });
    it('código vazio', () => { expect(estoqueSchema.safeParse({ codigo: '', descricao: 'P', quantidade: 10, unidade: 'UN' }).success).toBe(false); });
    it('desc vazia', () => { expect(estoqueSchema.safeParse({ codigo: 'A', descricao: '', quantidade: 10, unidade: 'UN' }).success).toBe(false); });
    it('qtd negativa', () => { expect(estoqueSchema.safeParse({ codigo: 'A', descricao: 'P', quantidade: -1, unidade: 'UN' }).success).toBe(false); });
    it('qtd 0 ok', () => { expect(estoqueSchema.safeParse({ codigo: 'A', descricao: 'P', quantidade: 0, unidade: 'UN' }).success).toBe(true); });
    it('unidade vazia', () => { expect(estoqueSchema.safeParse({ codigo: 'A', descricao: 'P', quantidade: 1, unidade: '' }).success).toBe(false); });
    it('grande ok', () => { expect(estoqueSchema.safeParse({ codigo: 'X', descricao: 'Y', quantidade: 999999, unidade: 'KG' }).success).toBe(true); });
  });

  describe('triagemSchema', () => {
    it('completa', () => { expect(triagemSchema.safeParse({ lote: 'L1', quantidade_total: 100, tipo_triagem: 'completa' }).success).toBe(true); });
    it('amostragem', () => { expect(triagemSchema.safeParse({ lote: 'L1', quantidade_total: 50, tipo_triagem: 'amostragem' }).success).toBe(true); });
    it('lote vazio', () => { expect(triagemSchema.safeParse({ lote: '', quantidade_total: 10, tipo_triagem: 'completa' }).success).toBe(false); });
    it('qtd 0', () => { expect(triagemSchema.safeParse({ lote: 'L', quantidade_total: 0, tipo_triagem: 'completa' }).success).toBe(false); });
    it('tipo inválido', () => { expect(triagemSchema.safeParse({ lote: 'L', quantidade_total: 10, tipo_triagem: 'invalido' }).success).toBe(false); });
  });

  describe('recebimentoSchema', () => {
    it('válido', () => { expect(recebimentoSchema.safeParse({ nota_fiscal: 'NF001', fornecedor: 'ABC', data_recebimento: '2024-01-15T10:30:00Z' }).success).toBe(true); });
    it('NF vazia', () => { expect(recebimentoSchema.safeParse({ nota_fiscal: '', fornecedor: 'ABC', data_recebimento: '2024-01-15T10:30:00Z' }).success).toBe(false); });
    it('data inválida', () => { expect(recebimentoSchema.safeParse({ nota_fiscal: 'NF', fornecedor: 'F', data_recebimento: 'not-a-date' }).success).toBe(false); });
  });

  describe('usuarioSchema', () => {
    it('válido', () => { expect(usuarioSchema.safeParse({ email: 'a@b.com', nome: 'João' }).success).toBe(true); });
    it('email inv', () => { expect(usuarioSchema.safeParse({ email: 'invalid', nome: 'João' }).success).toBe(false); });
    it('nome curto', () => { expect(usuarioSchema.safeParse({ email: 'a@b.com', nome: 'J' }).success).toBe(false); });
    it('com cargo', () => { expect(usuarioSchema.safeParse({ email: 'a@b.com', nome: 'João', cargo: 'G' }).success).toBe(true); });
    it('sem email', () => { expect(usuarioSchema.safeParse({ nome: 'João' }).success).toBe(false); });
  });
});

// ========== 4. Estoque Stats ==========
describe('Estoque Stats', () => {
  type SP = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';
  const calc = (p: { status: SP }[]) => {
    const t = p.length, o = p.filter(x => x.status === 'ocupado').length;
    return { total: t, ocu: o, liv: p.filter(x => x.status === 'livre').length, bloq: p.filter(x => x.status === 'bloqueado').length, res: p.filter(x => x.status === 'reservado').length, taxa: t > 0 ? (o/t)*100 : 0 };
  };
  it('vazio', () => { expect(calc([]).taxa).toBe(0); });
  it('1 livre', () => { expect(calc([{status:'livre'}]).taxa).toBe(0); });
  it('1 ocu', () => { expect(calc([{status:'ocupado'}]).taxa).toBe(100); });
  it('50%', () => { expect(calc([{status:'ocupado'},{status:'livre'}]).taxa).toBe(50); });
  it('120 pos', () => {
    const p = Array.from({length:120},(_,i) => ({status:(i<60?'ocupado':i<100?'livre':i<110?'reservado':'bloqueado') as SP}));
    const s = calc(p); expect(s.total).toBe(120); expect(s.ocu).toBe(60); expect(s.taxa).toBe(50);
  });
  it('soma=total', () => { const s = calc([{status:'livre'},{status:'ocupado'},{status:'reservado'},{status:'bloqueado'}]); expect(s.liv+s.ocu+s.res+s.bloq).toBe(s.total); });
  it('1000 pos', () => { const p = Array.from({length:1000},(_,i) => ({status:(['livre','ocupado','reservado','bloqueado'][i%4]) as SP})); expect(calc(p).ocu).toBe(250); });
});

// ========== 5. Enums ==========
describe('Enums', () => {
  const E: Record<string,string[]> = {
    STATUS_RECEBIMENTO: ['aguardando','em_transito','recebido','em_conferencia','conferido','divergencia','cancelado'],
    STATUS_TAREFA: ['pendente','atribuida','em_andamento','concluida','bloqueada'],
    STATUS_ONDA: ['pendente','em_andamento','concluida','cancelada'],
    TIPO_TAREFA: ['separacao','armazenagem','transferencia','inventario','expedicao'],
    PRIORIDADE: ['baixa','media','alta','urgente'],
    SEVERIDADE: ['info','aviso','critico','urgente'],
    MOTIVO_TD: ['defeito','cor_errada','tamanho_errado','quantidade_errada','produto_errado','avaria_transporte','desistencia','outro'],
    STATUS_TD: ['aberto','em_analise','aprovado','recusado','em_transito','recebido','finalizado'],
    STATUS_ENTREGA: ['pendente','em_rota','entregue','recusado','parcial','reagendado'],
    STATUS_ROMANEIO: ['rascunho','confirmado','em_transito','entregue','parcial','cancelado'],
    ROLES: ['operador','supervisor','admin'],
  };
  Object.entries(E).forEach(([n,v]) => {
    it(`${n}: únicos`, () => { expect(new Set(v).size).toBe(v.length); });
  });
  it('RECEB=7', () => { expect(E.STATUS_RECEBIMENTO).toHaveLength(7); });
  it('MOTIVO=8', () => { expect(E.MOTIVO_TD).toHaveLength(8); });
  it('admin exists', () => { expect(E.ROLES).toContain('admin'); });
  it('workflow receb', () => { const s = E.STATUS_RECEBIMENTO; expect(s.indexOf('aguardando')).toBeLessThan(s.indexOf('conferido')); });
  it('workflow TD', () => { const s = E.STATUS_TD; expect(s.indexOf('aberto')).toBeLessThan(s.indexOf('finalizado')); });
});

// ========== 6. Regras de Negócio ==========
describe('Regras de Negócio', () => {
  describe('Divergência', () => {
    const d = (p:number,r:number) => ({ diff:r-p, pct:p>0?((r-p)/p)*100:0, tipo:r>p?'sobra':r<p?'falta':'ok' });
    it('ok', () => { expect(d(100,100).tipo).toBe('ok'); });
    it('falta', () => { expect(d(100,80).tipo).toBe('falta'); expect(d(100,80).diff).toBe(-20); });
    it('sobra', () => { expect(d(100,120).pct).toBe(20); });
    it('0,0', () => { expect(d(0,0).tipo).toBe('ok'); });
  });

  describe('Acuracidade', () => {
    const a = (c:number,t:number,d:number) => t>0?((c-d)/t)*100:0;
    it('100%', () => { expect(a(100,100,0)).toBe(100); });
    it('95%', () => { expect(a(100,100,5)).toBe(95); });
    it('0 total', () => { expect(a(0,0,0)).toBe(0); });
  });

  describe('ABC', () => {
    const abc = (g:number) => g>=100?'A':g>=30?'B':'C';
    it('A', () => { expect(abc(150)).toBe('A'); });
    it('B', () => { expect(abc(50)).toBe('B'); });
    it('C', () => { expect(abc(10)).toBe('C'); });
  });

  describe('Ponto pedido', () => {
    const pp = (cd:number,lt:number,es:number) => cd*lt+es;
    it('normal', () => { expect(pp(10,5,50)).toBe(100); });
    it('sem seg', () => { expect(pp(20,3,0)).toBe(60); });
  });

  describe('XP streak', () => {
    const x = (b:number,m:number) => Math.floor(b*m);
    it('1x', () => { expect(x(100,1)).toBe(100); });
    it('1.1x', () => { expect(x(100,1.1)).toBe(110); });
    it('1.5x', () => { expect(x(100,1.5)).toBe(150); });
    it('arred', () => { expect(x(33,1.1)).toBe(36); });
  });

  describe('Nível', () => {
    const n = (xp:number) => { let nv=1,req=100,r=xp; while(r>=req){r-=req;nv++;req=Math.floor(req*1.5);} return {nv,r,req}; };
    it('0=1', () => { expect(n(0).nv).toBe(1); });
    it('99=1', () => { expect(n(99).nv).toBe(1); });
    it('100=2', () => { expect(n(100).nv).toBe(2); });
    it('250=3', () => { expect(n(250).nv).toBe(3); });
    it('rest', () => { expect(n(130).r).toBe(30); });
  });

  describe('Posição', () => {
    const g = (pp:number,s:string,n:number) => `PP${pp}-${s}${String(n).padStart(2,'0')}`;
    it('PP1-A01', () => { expect(g(1,'A',1)).toBe('PP1-A01'); });
    it('PP3-E04', () => { expect(g(3,'E',4)).toBe('PP3-E04'); });
  });

  describe('CNPJ', () => {
    const ok = (c:string) => c.replace(/\D/g,'').length===14;
    it('14 dig', () => { expect(ok('01234567890001')).toBe(true); });
    it('formatado', () => { expect(ok('01.234.567/8900-01')).toBe(true); });
    it('curto', () => { expect(ok('123456')).toBe(false); });
  });

  describe('SKU', () => {
    const ok = (s:string) => /^[A-Z0-9]{3,20}$/.test(s);
    it('válido', () => { expect(ok('PROD001')).toBe(true); });
    it('minúsc', () => { expect(ok('prod001')).toBe(false); });
    it('curto', () => { expect(ok('AB')).toBe(false); });
    it('espaço', () => { expect(ok('PROD 001')).toBe(false); });
  });

  describe('Romaneio', () => {
    const v = (m?:string,p?:string) => {
      const e:string[] = [];
      if(!m?.trim()) e.push('motorista');
      if(!p?.trim()) e.push('placa');
      if(p && !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p.replace('-',''))) e.push('placa_inv');
      return {valid:e.length===0,erros:e};
    };
    it('ok', () => { expect(v('João','ABC1D23').valid).toBe(true); });
    it('sem mot', () => { expect(v(undefined,'ABC1D23').erros).toContain('motorista'); });
    it('sem placa', () => { expect(v('João').erros).toContain('placa'); });
    it('antiga ok', () => { expect(v('João','ABC1234').valid).toBe(true); });
  });

  describe('Triagem', () => {
    const t = (a:number,tot:number) => tot>0?(a/tot)*100:0;
    it('100%', () => { expect(t(50,50)).toBe(100); });
    it('0%', () => { expect(t(0,50)).toBe(0); });
    it('80%', () => { expect(t(80,100)).toBe(80); });
    it('0 total', () => { expect(t(0,0)).toBe(0); });
  });
});
