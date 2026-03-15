/**
 * SUITE EXAUSTIVA DE TESTES — VALIDATORS
 * ~80 cenários cobrindo todas as funções de validação
 */
import { describe, it, expect } from 'vitest';
import {
  validarCPF, validarCNPJ, validarEmail, validarTelefone, validarCEP,
  validarNumeroPositivo, validarNumeroNaoNegativo, validarInteiro,
  validarIntervalo, validarPercentual,
  validarTextoObrigatorio, validarTamanhoMinimo, validarTamanhoMaximo,
  validarEAN13, validarData, validarDataFutura, validarDataPassada,
  validarCodigoLote, validarPosicaoEstoque,
  validarQuantidadeTriagem, validarChecklistCompleto,
  combinarValidacoes, criarValidacao,
} from '@/utils/validators';

// ========== CPF ==========
describe('validarCPF', () => {
  it('rejeita null/undefined/vazio', () => {
    expect(validarCPF(null)).toBe(false);
    expect(validarCPF(undefined)).toBe(false);
    expect(validarCPF('')).toBe(false);
  });
  it('rejeita dígitos repetidos', () => {
    expect(validarCPF('11111111111')).toBe(false);
    expect(validarCPF('00000000000')).toBe(false);
  });
  it('rejeita tamanho errado', () => {
    expect(validarCPF('123')).toBe(false);
    expect(validarCPF('1234567890123')).toBe(false);
  });
  it('aceita CPF válido formatado', () => {
    expect(validarCPF('529.982.247-25')).toBe(true);
  });
  it('aceita CPF válido sem formatação', () => {
    expect(validarCPF('52998224725')).toBe(true);
  });
  it('rejeita CPF com dígito errado', () => {
    expect(validarCPF('52998224720')).toBe(false);
  });
});

// ========== CNPJ ==========
describe('validarCNPJ', () => {
  it('rejeita null/undefined/vazio', () => {
    expect(validarCNPJ(null)).toBe(false);
    expect(validarCNPJ(undefined)).toBe(false);
    expect(validarCNPJ('')).toBe(false);
  });
  it('rejeita dígitos repetidos', () => {
    expect(validarCNPJ('11111111111111')).toBe(false);
  });
  it('rejeita tamanho errado', () => {
    expect(validarCNPJ('123')).toBe(false);
  });
  it('aceita CNPJ válido', () => {
    expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    expect(validarCNPJ('11222333000181')).toBe(true);
  });
  it('rejeita CNPJ inválido', () => {
    expect(validarCNPJ('11222333000100')).toBe(false);
  });
});

// ========== Email ==========
describe('validarEmail', () => {
  it('rejeita null/undefined/vazio', () => {
    expect(validarEmail(null)).toBe(false);
    expect(validarEmail(undefined)).toBe(false);
    expect(validarEmail('')).toBe(false);
  });
  it('aceita email válido', () => {
    expect(validarEmail('user@test.com')).toBe(true);
    expect(validarEmail('a.b@c.d.e')).toBe(true);
  });
  it('rejeita sem @', () => expect(validarEmail('invalid')).toBe(false));
  it('rejeita sem domínio', () => expect(validarEmail('user@')).toBe(false));
  it('rejeita com espaço', () => expect(validarEmail('user @test.com')).toBe(false));
});

// ========== Telefone ==========
describe('validarTelefone', () => {
  it('rejeita null/vazio', () => {
    expect(validarTelefone(null)).toBe(false);
    expect(validarTelefone('')).toBe(false);
  });
  it('aceita 10 dígitos (fixo)', () => expect(validarTelefone('1134567890')).toBe(true));
  it('aceita 11 dígitos (celular)', () => expect(validarTelefone('11934567890')).toBe(true));
  it('aceita formatado', () => expect(validarTelefone('(11) 93456-7890')).toBe(true));
  it('rejeita 9 dígitos', () => expect(validarTelefone('123456789')).toBe(false));
});

// ========== CEP ==========
describe('validarCEP', () => {
  it('aceita 8 dígitos', () => expect(validarCEP('01310100')).toBe(true));
  it('aceita formatado', () => expect(validarCEP('01310-100')).toBe(true));
  it('rejeita curto', () => expect(validarCEP('123')).toBe(false));
  it('rejeita null', () => expect(validarCEP(null)).toBe(false));
});

// ========== Números ==========
describe('validarNumeroPositivo', () => {
  it('true para 1', () => expect(validarNumeroPositivo(1)).toBe(true));
  it('false para 0', () => expect(validarNumeroPositivo(0)).toBe(false));
  it('false para -1', () => expect(validarNumeroPositivo(-1)).toBe(false));
  it('true para string "5"', () => expect(validarNumeroPositivo('5')).toBe(true));
  it('false para null', () => expect(validarNumeroPositivo(null)).toBe(false));
  it('false para NaN string', () => expect(validarNumeroPositivo('abc')).toBe(false));
});

describe('validarNumeroNaoNegativo', () => {
  it('true para 0', () => expect(validarNumeroNaoNegativo(0)).toBe(true));
  it('true para 100', () => expect(validarNumeroNaoNegativo(100)).toBe(true));
  it('false para -1', () => expect(validarNumeroNaoNegativo(-1)).toBe(false));
  it('false para undefined', () => expect(validarNumeroNaoNegativo(undefined)).toBe(false));
});

describe('validarInteiro', () => {
  it('true para 5', () => expect(validarInteiro(5)).toBe(true));
  it('false para 5.5', () => expect(validarInteiro(5.5)).toBe(false));
  it('true para "10"', () => expect(validarInteiro('10')).toBe(true));
  it('false para "10.5"', () => expect(validarInteiro('10.5')).toBe(false));
});

describe('validarIntervalo', () => {
  it('dentro', () => expect(validarIntervalo(5, 1, 10)).toBe(true));
  it('min', () => expect(validarIntervalo(1, 1, 10)).toBe(true));
  it('max', () => expect(validarIntervalo(10, 1, 10)).toBe(true));
  it('abaixo', () => expect(validarIntervalo(0, 1, 10)).toBe(false));
  it('acima', () => expect(validarIntervalo(11, 1, 10)).toBe(false));
  it('null', () => expect(validarIntervalo(null, 1, 10)).toBe(false));
});

describe('validarPercentual', () => {
  it('0 ok', () => expect(validarPercentual(0)).toBe(true));
  it('100 ok', () => expect(validarPercentual(100)).toBe(true));
  it('50 ok', () => expect(validarPercentual(50)).toBe(true));
  it('-1 fail', () => expect(validarPercentual(-1)).toBe(false));
  it('101 fail', () => expect(validarPercentual(101)).toBe(false));
});

// ========== Texto ==========
describe('validarTextoObrigatorio', () => {
  it('ok com texto', () => expect(validarTextoObrigatorio('abc')).toBe(true));
  it('fail com vazio', () => expect(validarTextoObrigatorio('')).toBe(false));
  it('fail com espaços', () => expect(validarTextoObrigatorio('   ')).toBe(false));
  it('fail com null', () => expect(validarTextoObrigatorio(null)).toBe(false));
});

describe('validarTamanhoMinimo', () => {
  it('ok', () => expect(validarTamanhoMinimo('abc', 2)).toBe(true));
  it('fail', () => expect(validarTamanhoMinimo('a', 2)).toBe(false));
  it('null', () => expect(validarTamanhoMinimo(null, 1)).toBe(false));
});

describe('validarTamanhoMaximo', () => {
  it('ok', () => expect(validarTamanhoMaximo('ab', 5)).toBe(true));
  it('fail', () => expect(validarTamanhoMaximo('abcdef', 5)).toBe(false));
  it('null ok', () => expect(validarTamanhoMaximo(null, 5)).toBe(true));
});

// ========== EAN-13 ==========
describe('validarEAN13', () => {
  it('aceita EAN válido', () => expect(validarEAN13('7891234567893')).toBe(true));
  it('rejeita dígito errado', () => expect(validarEAN13('7891234567890')).toBe(false));
  it('rejeita tamanho errado', () => expect(validarEAN13('123')).toBe(false));
  it('rejeita null', () => expect(validarEAN13(null)).toBe(false));
});

// ========== Datas ==========
describe('validarData', () => {
  it('ok string ISO', () => expect(validarData('2024-01-15')).toBe(true));
  it('ok Date', () => expect(validarData(new Date())).toBe(true));
  it('fail inválida', () => expect(validarData('not-a-date')).toBe(false));
  it('fail null', () => expect(validarData(null)).toBe(false));
});

describe('validarDataFutura', () => {
  it('futuro ok', () => expect(validarDataFutura(new Date(Date.now() + 86400000))).toBe(true));
  it('passado fail', () => expect(validarDataFutura(new Date('2020-01-01'))).toBe(false));
});

describe('validarDataPassada', () => {
  it('passado ok', () => expect(validarDataPassada(new Date('2020-01-01'))).toBe(true));
  it('futuro fail', () => expect(validarDataPassada(new Date(Date.now() + 86400000))).toBe(false));
});

// ========== Estoque ==========
describe('validarCodigoLote', () => {
  it('ok alfanumérico', () => expect(validarCodigoLote('LOT-001')).toBe(true));
  it('ok curto 3', () => expect(validarCodigoLote('ABC')).toBe(true));
  it('fail 2 chars', () => expect(validarCodigoLote('AB')).toBe(false));
  it('fail null', () => expect(validarCodigoLote(null)).toBe(false));
  it('fail com espaço', () => expect(validarCodigoLote('AB CD')).toBe(false));
});

describe('validarPosicaoEstoque', () => {
  it('ok A01-B02', () => expect(validarPosicaoEstoque('A01-B02')).toBe(true));
  it('ok A01-B02-C03', () => expect(validarPosicaoEstoque('A01-B02-C03')).toBe(true));
  it('ok single', () => expect(validarPosicaoEstoque('A01')).toBe(true));
  it('fail null', () => expect(validarPosicaoEstoque(null)).toBe(false));
  it('fail formato errado', () => expect(validarPosicaoEstoque('ABC')).toBe(false));
});

// ========== Triagem ==========
describe('validarQuantidadeTriagem', () => {
  it('ok exato', () => {
    const r = validarQuantidadeTriagem(100, 100, 5);
    expect(r.valido).toBe(true);
    expect(r.diferenca).toBe(0);
    expect(r.percentual).toBe(0);
  });
  it('ok dentro tolerância', () => {
    const r = validarQuantidadeTriagem(100, 95, 5);
    expect(r.valido).toBe(true);
  });
  it('fail fora tolerância', () => {
    const r = validarQuantidadeTriagem(100, 90, 5);
    expect(r.valido).toBe(false);
    expect(r.percentual).toBe(10);
  });
  it('sobra fora tolerância', () => {
    const r = validarQuantidadeTriagem(100, 110, 5);
    expect(r.valido).toBe(false);
  });
});

// ========== Checklist ==========
describe('validarChecklistCompleto', () => {
  it('completo', () => {
    const r = validarChecklistCompleto({ a: true, b: true }, ['a', 'b']);
    expect(r.valido).toBe(true);
    expect(r.faltantes).toEqual([]);
  });
  it('incompleto', () => {
    const r = validarChecklistCompleto({ a: true, b: false }, ['a', 'b']);
    expect(r.valido).toBe(false);
    expect(r.faltantes).toEqual(['b']);
  });
  it('item faltando', () => {
    const r = validarChecklistCompleto({ a: true }, ['a', 'b']);
    expect(r.valido).toBe(false);
    expect(r.faltantes).toContain('b');
  });
});

// ========== Combinação ==========
describe('combinarValidacoes', () => {
  it('todas válidas', () => {
    const r = combinarValidacoes({ valido: true }, { valido: true });
    expect(r.valido).toBe(true);
    expect(r.erros).toHaveLength(0);
  });
  it('com erros', () => {
    const r = combinarValidacoes(
      { valido: false, erro: 'Campo obrigatório' },
      { valido: true },
      { valido: false, erro: 'Valor inválido' }
    );
    expect(r.valido).toBe(false);
    expect(r.erros).toHaveLength(2);
  });
});

describe('criarValidacao', () => {
  it('condição verdadeira', () => {
    const r = criarValidacao(true, 'Erro');
    expect(r.valido).toBe(true);
    expect(r.erro).toBeUndefined();
  });
  it('condição falsa', () => {
    const r = criarValidacao(false, 'Campo obrigatório');
    expect(r.valido).toBe(false);
    expect(r.erro).toBe('Campo obrigatório');
  });
});
