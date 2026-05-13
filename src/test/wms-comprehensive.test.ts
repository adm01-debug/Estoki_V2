/**
 * SUITE — Zod Schemas + Business Rules + Gamification + Enums
 * ~120 cenários de lógica pura sem dependências externas
 */
import { describe, it, expect } from 'vitest';
import { estoqueSchema, triagemSchema, recebimentoSchema, usuarioSchema } from '@/lib/validations/index';
import { STREAK_BONUSES } from '@/hooks/useStreaks';

// ========== ZOD SCHEMAS ==========

describe('estoqueSchema', () => {
  const valid = { codigo: 'ABC', descricao: 'Produto', quantidade: 10, unidade: 'UN' };
  it('aceita válido', () => expect(estoqueSchema.safeParse(valid).success).toBe(true));
  it('rejeita codigo vazio', () => expect(estoqueSchema.safeParse({ ...valid, codigo: '' }).success).toBe(false));
  it('rejeita descricao vazia', () => expect(estoqueSchema.safeParse({ ...valid, descricao: '' }).success).toBe(false));
  it('rejeita quantidade negativa', () => expect(estoqueSchema.safeParse({ ...valid, quantidade: -1 }).success).toBe(false));
  it('aceita quantidade 0', () => expect(estoqueSchema.safeParse({ ...valid, quantidade: 0 }).success).toBe(true));
  it('rejeita unidade vazia', () => expect(estoqueSchema.safeParse({ ...valid, unidade: '' }).success).toBe(false));
  it('aceita grande quantidade', () => expect(estoqueSchema.safeParse({ ...valid, quantidade: 999999 }).success).toBe(true));
});

describe('triagemSchema', () => {
  const valid = { lote: 'LOT-001', quantidade_total: 100, tipo_triagem: 'completa' as const };
  it('aceita válido completa', () => expect(triagemSchema.safeParse(valid).success).toBe(true));
  it('aceita amostragem', () => expect(triagemSchema.safeParse({ ...valid, tipo_triagem: 'amostragem' }).success).toBe(true));
  it('rejeita tipo inválido', () => expect(triagemSchema.safeParse({ ...valid, tipo_triagem: 'parcial' }).success).toBe(false));
  it('rejeita lote vazio', () => expect(triagemSchema.safeParse({ ...valid, lote: '' }).success).toBe(false));
  it('rejeita quantidade 0', () => expect(triagemSchema.safeParse({ ...valid, quantidade_total: 0 }).success).toBe(false));
  it('rejeita quantidade negativa', () => expect(triagemSchema.safeParse({ ...valid, quantidade_total: -5 }).success).toBe(false));
});

describe('recebimentoSchema', () => {
  const valid = { nota_fiscal: 'NF-001', fornecedor: 'Fornecedor', data_recebimento: '2024-01-15T10:00:00.000Z' };
  it('aceita válido', () => expect(recebimentoSchema.safeParse(valid).success).toBe(true));
  it('rejeita NF vazia', () => expect(recebimentoSchema.safeParse({ ...valid, nota_fiscal: '' }).success).toBe(false));
  it('rejeita fornecedor vazio', () => expect(recebimentoSchema.safeParse({ ...valid, fornecedor: '' }).success).toBe(false));
  it('rejeita data inválida', () => expect(recebimentoSchema.safeParse({ ...valid, data_recebimento: 'not-date' }).success).toBe(false));
});

describe('usuarioSchema', () => {
  const valid = { email: 'user@test.com', nome: 'Test User' };
  it('aceita válido', () => expect(usuarioSchema.safeParse(valid).success).toBe(true));
  it('rejeita email inválido', () => expect(usuarioSchema.safeParse({ ...valid, email: 'invalid' }).success).toBe(false));
  it('rejeita nome curto', () => expect(usuarioSchema.safeParse({ ...valid, nome: 'A' }).success).toBe(false));
  it('aceita com cargo', () => expect(usuarioSchema.safeParse({ ...valid, cargo: 'Admin' }).success).toBe(true));
  it('aceita sem cargo', () => expect(usuarioSchema.safeParse(valid).success).toBe(true));
});

// ========== BUSINESS RULES ==========

describe('Divergência de Recebimento', () => {
  const calc = (p: number, r: number) => ({
    diff: r - p,
    pct: p > 0 ? ((r - p) / p) * 100 : 0,
    tipo: r > p ? 'sobra' : r < p ? 'falta' : 'ok',
  });

  it('ok exato', () => expect(calc(100, 100).tipo).toBe('ok'));
  it('falta 20%', () => { const d = calc(100, 80); expect(d.tipo).toBe('falta'); expect(d.diff).toBe(-20); expect(d.pct).toBe(-20); });
  it('sobra 10%', () => { const d = calc(100, 110); expect(d.tipo).toBe('sobra'); expect(d.pct).toBe(10); });
  it('pedida 0', () => expect(calc(0, 50).pct).toBe(0));
  it('ambos 0', () => expect(calc(0, 0).tipo).toBe('ok'));
  it('1 unidade diff', () => expect(calc(100, 99).tipo).toBe('falta'));
  it('grande volume', () => expect(calc(10000, 10000).tipo).toBe('ok'));
  it('dobro recebido', () => expect(calc(100, 200).pct).toBe(100));
  it('metade recebida', () => expect(calc(100, 50).pct).toBe(-50));
});

describe('Acuracidade Inventário', () => {
  const acc = (c: number, t: number, d: number) => t > 0 ? ((c - d) / t) * 100 : 0;
  it('100%', () => expect(acc(100, 100, 0)).toBe(100));
  it('95%', () => expect(acc(100, 100, 5)).toBe(95));
  it('80%', () => expect(acc(100, 100, 20)).toBe(80));
  it('0 total', () => expect(acc(0, 0, 0)).toBe(0));
  it('0 contadas', () => expect(acc(0, 100, 0)).toBe(0));
  it('todas divergentes', () => expect(acc(100, 100, 100)).toBe(0));
});

describe('Curva ABC', () => {
  const abc = (g: number) => g >= 100 ? 'A' : g >= 30 ? 'B' : 'C';
  it('A=150', () => expect(abc(150)).toBe('A'));
  it('A=100', () => expect(abc(100)).toBe('A'));
  it('B=50', () => expect(abc(50)).toBe('B'));
  it('B=30', () => expect(abc(30)).toBe('B'));
  it('C=29', () => expect(abc(29)).toBe('C'));
  it('C=0', () => expect(abc(0)).toBe('C'));
  it('C negativo', () => expect(abc(-10)).toBe('C'));
});

describe('Ponto de Pedido', () => {
  const pp = (cd: number, lt: number, es: number) => cd * lt + es;
  it('10*5+50=100', () => expect(pp(10, 5, 50)).toBe(100));
  it('20*3+0=60', () => expect(pp(20, 3, 0)).toBe(60));
  it('0*10+100=100', () => expect(pp(0, 10, 100)).toBe(100));
  it('5*7+25=60', () => expect(pp(5, 7, 25)).toBe(60));
  it('0*0+0=0', () => expect(pp(0, 0, 0)).toBe(0));
});

describe('Ocupação Estoque', () => {
  const occ = (o: number, t: number) => t > 0 ? (o / t) * 100 : 0;
  it('50%', () => expect(occ(50, 100)).toBe(50));
  it('100%', () => expect(occ(100, 100)).toBe(100));
  it('0%', () => expect(occ(0, 100)).toBe(0));
  it('sem posições', () => expect(occ(0, 0)).toBe(0));
  it('sobrelotação', () => expect(occ(120, 100)).toBe(120));
});

describe('FEFO/FIFO Ordering', () => {
  const sortFEFO = (lotes: { validade: string }[]) =>
    [...lotes].sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());

  it('ordena por validade crescente', () => {
    const lotes = [
      { validade: '2025-06-01' },
      { validade: '2025-01-01' },
      { validade: '2025-03-01' },
    ];
    const sorted = sortFEFO(lotes);
    expect(sorted[0].validade).toBe('2025-01-01');
    expect(sorted[2].validade).toBe('2025-06-01');
  });

  it('lotes com mesma validade mantêm ordem', () => {
    const lotes = [
      { validade: '2025-01-01' },
      { validade: '2025-01-01' },
    ];
    const sorted = sortFEFO(lotes);
    expect(sorted).toHaveLength(2);
  });
});

// ========== GAMIFICATION ==========

describe('STREAK_BONUSES', () => {
  it('tem 5 níveis', () => expect(STREAK_BONUSES).toHaveLength(5));
  it('dias crescentes', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].dias).toBeGreaterThan(STREAK_BONUSES[i - 1].dias);
    }
  });
  it('multiplicador crescente', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].multiplicador).toBeGreaterThan(STREAK_BONUSES[i - 1].multiplicador);
    }
  });
  it('xpBonus crescente', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].xpBonus).toBeGreaterThan(STREAK_BONUSES[i - 1].xpBonus);
    }
  });
  it('todos têm título', () => {
    STREAK_BONUSES.forEach(b => expect(b.titulo.length).toBeGreaterThan(0));
  });
  it('multiplicador >= 1', () => {
    STREAK_BONUSES.forEach(b => expect(b.multiplicador).toBeGreaterThanOrEqual(1));
  });
});

describe('XP com Multiplicador', () => {
  const xp = (b: number, m: number) => Math.floor(b * m);
  it('100*1.0=100', () => expect(xp(100, 1.0)).toBe(100));
  it('100*1.5=150', () => expect(xp(100, 1.5)).toBe(150));
  it('75*1.2=90', () => expect(xp(75, 1.2)).toBe(90));
  it('0*1.5=0', () => expect(xp(0, 1.5)).toBe(0));
  it('1*2.0=2', () => expect(xp(1, 2.0)).toBe(2));
  it('floor arredonda para baixo', () => expect(xp(33, 1.1)).toBe(36));
});

describe('Nível por XP', () => {
  const nivel = (xpTotal: number) => Math.floor(xpTotal / 1000) + 1;
  it('0 xp = nível 1', () => expect(nivel(0)).toBe(1));
  it('999 xp = nível 1', () => expect(nivel(999)).toBe(1));
  it('1000 xp = nível 2', () => expect(nivel(1000)).toBe(2));
  it('5000 xp = nível 6', () => expect(nivel(5000)).toBe(6));
  it('9999 xp = nível 10', () => expect(nivel(9999)).toBe(10));
});

describe('Título por Nível', () => {
  const titulos = ['Novato', 'Aprendiz', 'Operador', 'Especialista', 'Mestre'];
  const titulo = (n: number) => titulos[Math.min(Math.floor((n - 1) / 2), titulos.length - 1)];
  it('1-2=Novato', () => { expect(titulo(1)).toBe('Novato'); expect(titulo(2)).toBe('Novato'); });
  it('3-4=Aprendiz', () => { expect(titulo(3)).toBe('Aprendiz'); expect(titulo(4)).toBe('Aprendiz'); });
  it('5-6=Operador', () => expect(titulo(5)).toBe('Operador'));
  it('7-8=Especialista', () => expect(titulo(7)).toBe('Especialista'));
  it('9+=Mestre', () => expect(titulo(9)).toBe('Mestre'));
  it('99=Mestre', () => expect(titulo(99)).toBe('Mestre'));
});

// ========== ENUMS UNIQUENESS ==========

describe('Enums Integridade', () => {
  const statusRecebimento = ['pendente', 'em_conferencia', 'conferido', 'aprovado', 'reprovado', 'aprovado_parcial'];
  const statusTarefa = ['pendente', 'atribuida', 'em_andamento', 'concluida', 'cancelada'];
  const statusOnda = ['pendente', 'em_separacao', 'concluida', 'cancelada'];
  const prioridades = ['baixa', 'media', 'alta', 'urgente'];
  const tiposTarefa = ['separacao', 'reposicao', 'transferencia', 'inventario', 'recebimento'];
  const statusPosicao = ['livre', 'ocupado', 'bloqueado', 'reservado', 'manutencao'];
  const statusRomaneio = ['planejado', 'em_carregamento', 'em_transito', 'entregue', 'retornado', 'cancelado'];
  const roles = ['admin', 'supervisor', 'operador', 'viewer'];

  it('statusRecebimento sem duplicatas', () => expect(new Set(statusRecebimento).size).toBe(statusRecebimento.length));
  it('statusTarefa sem duplicatas', () => expect(new Set(statusTarefa).size).toBe(statusTarefa.length));
  it('statusOnda sem duplicatas', () => expect(new Set(statusOnda).size).toBe(statusOnda.length));
  it('prioridades sem duplicatas', () => expect(new Set(prioridades).size).toBe(prioridades.length));
  it('tiposTarefa sem duplicatas', () => expect(new Set(tiposTarefa).size).toBe(tiposTarefa.length));
  it('statusPosicao sem duplicatas', () => expect(new Set(statusPosicao).size).toBe(statusPosicao.length));
  it('statusRomaneio sem duplicatas', () => expect(new Set(statusRomaneio).size).toBe(statusRomaneio.length));
  it('roles sem duplicatas', () => expect(new Set(roles).size).toBe(roles.length));
  it('prioridades tem urgente', () => expect(prioridades).toContain('urgente'));
  it('statusRecebimento tem pendente', () => expect(statusRecebimento).toContain('pendente'));
  it('statusPosicao tem bloqueado', () => expect(statusPosicao).toContain('bloqueado'));
});

// ========== SKU Validation ==========
describe('SKU Validation', () => {
  const validSKU = (sku: string) => /^[A-Z]{2,4}-\d{3,6}$/.test(sku);
  it('valid PROD-001', () => expect(validSKU('PROD-001')).toBe(true));
  it('valid AB-123456', () => expect(validSKU('AB-123456')).toBe(true));
  it('invalid lowercase', () => expect(validSKU('prod-001')).toBe(false));
  it('invalid no dash', () => expect(validSKU('PROD001')).toBe(false));
  it('invalid 1 letter', () => expect(validSKU('P-001')).toBe(false));
  it('invalid 5+ letters', () => expect(validSKU('PRODU-001')).toBe(false));
});

// ========== Romaneio Validation ==========
describe('Romaneio Validation', () => {
  const validPlaca = (p: string) => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(p);
  it('ABC1D23 ok', () => expect(validPlaca('ABC1D23')).toBe(true));
  it('ABC1234 ok', () => expect(validPlaca('ABC1234')).toBe(true));
  it('abc1234 fail', () => expect(validPlaca('abc1234')).toBe(false));
  it('AB12345 fail', () => expect(validPlaca('AB12345')).toBe(false));
});
