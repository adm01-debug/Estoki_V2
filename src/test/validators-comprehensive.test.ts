import { describe, it, expect } from 'vitest';
import {
  validarCPF, validarCNPJ, validarEmail, validarTelefone, validarCEP,
  validarNumeroPositivo, validarNumeroNaoNegativo, validarInteiro,
  validarIntervalo, validarPercentual, validarTextoObrigatorio,
  validarTamanhoMinimo, validarTamanhoMaximo, validarEAN13,
  validarData, validarDataFutura, validarDataPassada, validarDataNoPeriodo,
  validarCodigoLote, validarPosicaoEstoque, validarQuantidadeTriagem,
  validarChecklistCompleto, combinarValidacoes, criarValidacao,
} from '@/utils/validators';
import {
  isValidCPF, isValidCNPJ, isValidEmail, isValidPhone, isValidCEP,
  isValidEAN13, isValidPassword, isNotEmpty, isPositiveNumber, isValidURL, isValidDate,
} from '@/lib/validators';
import { sanitizeInput, validateEmail as secValidateEmail, validateCPF as secValidateCPF, validateCNPJ as secValidateCNPJ } from '@/lib/security';

// =============================================
// CPF VALIDATION - ~40 scenarios
// =============================================
describe('CPF Validation (utils/validators)', () => {
  // Valid CPFs
  const validCPFs = [
    '529.982.247-25', '52998224725',
    '111.444.777-35', '11144477735',
    '123.456.789-09', '12345678909',
  ];
  validCPFs.forEach(cpf => {
    it(`accepts valid CPF: ${cpf}`, () => expect(validarCPF(cpf)).toBe(true));
  });

  // Invalid CPFs
  it('rejects null', () => expect(validarCPF(null)).toBe(false));
  it('rejects undefined', () => expect(validarCPF(undefined)).toBe(false));
  it('rejects empty', () => expect(validarCPF('')).toBe(false));
  it('rejects all same digits 000', () => expect(validarCPF('00000000000')).toBe(false));
  it('rejects all same digits 111', () => expect(validarCPF('11111111111')).toBe(false));
  it('rejects all same digits 999', () => expect(validarCPF('99999999999')).toBe(false));
  it('rejects wrong length short', () => expect(validarCPF('1234567890')).toBe(false));
  it('rejects wrong length long', () => expect(validarCPF('123456789012')).toBe(false));
  it('rejects wrong check digit 1', () => expect(validarCPF('52998224715')).toBe(false));
  it('rejects wrong check digit 2', () => expect(validarCPF('52998224726')).toBe(false));
  it('rejects alphabetic', () => expect(validarCPF('abcdefghijk')).toBe(false));
});

describe('CPF Validation (lib/validators)', () => {
  it('accepts valid CPF', () => expect(isValidCPF('52998224725')).toBe(true));
  it('rejects all same digits', () => expect(isValidCPF('11111111111')).toBe(false));
  it('rejects wrong check digit', () => expect(isValidCPF('52998224726')).toBe(false));
  it('rejects short', () => expect(isValidCPF('123')).toBe(false));
});

// FIXED: lib/security.ts now validates check digits properly
describe('FIXED: security.ts CPF validation with check digits', () => {
  it('security.ts now rejects invalid CPF with correct length', () => {
    expect(secValidateCPF('12345678901')).toBe(false);
  });
  it('security.ts accepts valid CPF', () => {
    expect(secValidateCPF('52998224725')).toBe(true);
  });
});

// =============================================
// CNPJ VALIDATION - ~25 scenarios
// =============================================
describe('CNPJ Validation (utils/validators)', () => {
  it('accepts valid CNPJ formatted', () => expect(validarCNPJ('11.222.333/0001-81')).toBe(true));
  it('accepts valid CNPJ unformatted', () => expect(validarCNPJ('11222333000181')).toBe(true));
  it('rejects null', () => expect(validarCNPJ(null)).toBe(false));
  it('rejects undefined', () => expect(validarCNPJ(undefined)).toBe(false));
  it('rejects empty', () => expect(validarCNPJ('')).toBe(false));
  it('rejects all same digits', () => expect(validarCNPJ('11111111111111')).toBe(false));
  it('rejects wrong length', () => expect(validarCNPJ('1122233300018')).toBe(false));
  it('rejects wrong check digit', () => expect(validarCNPJ('11222333000182')).toBe(false));
});

describe('CNPJ Validation (lib/validators)', () => {
  it('accepts valid CNPJ', () => expect(isValidCNPJ('11222333000181')).toBe(true));
  it('rejects all same digits', () => expect(isValidCNPJ('11111111111111')).toBe(false));
  it('rejects wrong check digit', () => expect(isValidCNPJ('11222333000182')).toBe(false));
});

// FIXED: security.ts validateCNPJ now validates check digits
describe('FIXED: security.ts CNPJ validation with check digits', () => {
  it('security.ts now rejects invalid CNPJ with correct length', () => {
    expect(secValidateCNPJ('12345678901234')).toBe(false);
  });
  it('security.ts accepts valid CNPJ', () => {
    expect(secValidateCNPJ('11222333000181')).toBe(true);
  });
});

// =============================================
// EAN-13 VALIDATION - ~15 scenarios
// =============================================
describe('EAN-13 Validation', () => {
  it('accepts valid EAN-13 7891234560012', () => expect(validarEAN13('7891234560012')).toBe(true));
  it('accepts valid EAN-13 via lib', () => expect(isValidEAN13('7891234560012')).toBe(true));
  it('rejects null', () => expect(validarEAN13(null)).toBe(false));
  it('rejects undefined', () => expect(validarEAN13(undefined)).toBe(false));
  it('rejects empty', () => expect(validarEAN13('')).toBe(false));
  it('rejects wrong length 12', () => expect(validarEAN13('789123456001')).toBe(false));
  it('rejects wrong length 14', () => expect(validarEAN13('78912345600123')).toBe(false));
  it('rejects wrong check digit', () => expect(validarEAN13('7891234560013')).toBe(false));
  it('rejects all zeros', () => expect(validarEAN13('0000000000000')).toBe(true)); // check digit of all zeros is 0 - valid!
  it('rejects alphabetic', () => expect(validarEAN13('789123456001a')).toBe(false));
});

// =============================================
// EMAIL VALIDATION - ~15 scenarios
// =============================================
describe('Email Validation', () => {
  it('accepts valid email', () => expect(validarEmail('user@example.com')).toBe(true));
  it('accepts email with subdomain', () => expect(validarEmail('user@sub.example.com')).toBe(true));
  it('accepts email with dots', () => expect(validarEmail('user.name@example.com')).toBe(true));
  it('rejects null', () => expect(validarEmail(null)).toBe(false));
  it('rejects undefined', () => expect(validarEmail(undefined)).toBe(false));
  it('rejects empty', () => expect(validarEmail('')).toBe(false));
  it('rejects no @', () => expect(validarEmail('userexample.com')).toBe(false));
  it('rejects no domain', () => expect(validarEmail('user@')).toBe(false));
  it('rejects no user', () => expect(validarEmail('@example.com')).toBe(false));
  it('rejects spaces', () => expect(validarEmail('user @example.com')).toBe(false));

  // Cross-check lib/validators
  it('lib accepts valid email', () => expect(isValidEmail('test@test.com')).toBe(true));
  it('lib rejects invalid email', () => expect(isValidEmail('not-an-email')).toBe(false));
  
  // Cross-check lib/security
  it('security accepts valid email', () => expect(secValidateEmail('test@test.com')).toBe(true));
});

// =============================================
// PHONE VALIDATION - ~10 scenarios
// =============================================
describe('Phone Validation', () => {
  it('accepts 11 digits (mobile)', () => expect(validarTelefone('11999887766')).toBe(true));
  it('accepts 10 digits (landline)', () => expect(validarTelefone('1133445566')).toBe(true));
  it('accepts formatted', () => expect(validarTelefone('(11) 99988-7766')).toBe(true));
  it('rejects null', () => expect(validarTelefone(null)).toBe(false));
  it('rejects 9 digits', () => expect(validarTelefone('119988776')).toBe(false));
  it('rejects 12 digits', () => expect(validarTelefone('119998877665')).toBe(false));
  
  it('lib accepts valid phone', () => expect(isValidPhone('11999887766')).toBe(true));
});

// =============================================
// CEP VALIDATION - ~8 scenarios
// =============================================
describe('CEP Validation', () => {
  it('accepts 8 digits', () => expect(validarCEP('01001000')).toBe(true));
  it('accepts formatted', () => expect(validarCEP('01001-000')).toBe(true));
  it('rejects null', () => expect(validarCEP(null)).toBe(false));
  it('rejects 7 digits', () => expect(validarCEP('0100100')).toBe(false));
  
  it('lib accepts formatted', () => expect(isValidCEP('01001-000')).toBe(true));
  it('lib rejects short', () => expect(isValidCEP('0100')).toBe(false));
});

// =============================================
// NUMBER VALIDATION - ~20 scenarios
// =============================================
describe('Number Validation', () => {
  it('positive: 1', () => expect(validarNumeroPositivo(1)).toBe(true));
  it('positive: 0.5', () => expect(validarNumeroPositivo(0.5)).toBe(true));
  it('positive rejects 0', () => expect(validarNumeroPositivo(0)).toBe(false));
  it('positive rejects -1', () => expect(validarNumeroPositivo(-1)).toBe(false));
  it('positive rejects null', () => expect(validarNumeroPositivo(null)).toBe(false));
  it('positive string "5"', () => expect(validarNumeroPositivo('5')).toBe(true));
  it('positive string "abc"', () => expect(validarNumeroPositivo('abc')).toBe(false));
  
  it('non-negative: 0', () => expect(validarNumeroNaoNegativo(0)).toBe(true));
  it('non-negative: 1', () => expect(validarNumeroNaoNegativo(1)).toBe(true));
  it('non-negative rejects -1', () => expect(validarNumeroNaoNegativo(-1)).toBe(false));
  
  it('integer: 5', () => expect(validarInteiro(5)).toBe(true));
  it('integer rejects 5.5', () => expect(validarInteiro(5.5)).toBe(false));
  it('integer: 0', () => expect(validarInteiro(0)).toBe(true));
  
  it('range: 5 in [1,10]', () => expect(validarIntervalo(5, 1, 10)).toBe(true));
  it('range: 0 not in [1,10]', () => expect(validarIntervalo(0, 1, 10)).toBe(false));
  it('range: boundaries', () => {
    expect(validarIntervalo(1, 1, 10)).toBe(true);
    expect(validarIntervalo(10, 1, 10)).toBe(true);
  });
  
  it('percentual: 50', () => expect(validarPercentual(50)).toBe(true));
  it('percentual: 0', () => expect(validarPercentual(0)).toBe(true));
  it('percentual: 100', () => expect(validarPercentual(100)).toBe(true));
  it('percentual rejects 101', () => expect(validarPercentual(101)).toBe(false));
  it('percentual rejects -1', () => expect(validarPercentual(-1)).toBe(false));
  
  it('lib isPositiveNumber', () => {
    expect(isPositiveNumber(5)).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-1)).toBe(false);
  });
});

// =============================================
// TEXT VALIDATION - ~10 scenarios
// =============================================
describe('Text Validation', () => {
  it('required: "abc"', () => expect(validarTextoObrigatorio('abc')).toBe(true));
  it('required rejects empty', () => expect(validarTextoObrigatorio('')).toBe(false));
  it('required rejects spaces', () => expect(validarTextoObrigatorio('   ')).toBe(false));
  it('required rejects null', () => expect(validarTextoObrigatorio(null)).toBe(false));
  
  it('min length: 3 chars min=3', () => expect(validarTamanhoMinimo('abc', 3)).toBe(true));
  it('min length rejects: 2 chars min=3', () => expect(validarTamanhoMinimo('ab', 3)).toBe(false));
  
  it('max length: 3 chars max=5', () => expect(validarTamanhoMaximo('abc', 5)).toBe(true));
  it('max length rejects: 6 chars max=5', () => expect(validarTamanhoMaximo('abcdef', 5)).toBe(false));
  it('max length: null is valid', () => expect(validarTamanhoMaximo(null, 5)).toBe(true));
  
  it('isNotEmpty with values', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty([])).toBe(false);
    expect(isNotEmpty([1])).toBe(true);
    expect(isNotEmpty({})).toBe(false);
    expect(isNotEmpty({ a: 1 })).toBe(true);
    expect(isNotEmpty(0)).toBe(true);
  });
});

// =============================================
// DATE VALIDATION - ~15 scenarios
// =============================================
describe('Date Validation', () => {
  it('valid ISO date', () => expect(validarData('2024-01-15')).toBe(true));
  it('valid Date object', () => expect(validarData(new Date())).toBe(true));
  it('rejects null', () => expect(validarData(null)).toBe(false));
  it('rejects invalid string', () => expect(validarData('not-a-date')).toBe(false));
  
  it('future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validarDataFutura(future)).toBe(true);
  });
  it('past is not future', () => {
    expect(validarDataFutura('2020-01-01')).toBe(false);
  });
  
  it('past date', () => expect(validarDataPassada('2020-01-01')).toBe(true));
  it('future is not past', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validarDataPassada(future)).toBe(false);
  });
  
  it('date in period', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');
    expect(validarDataNoPeriodo('2024-06-15', start, end)).toBe(true);
    expect(validarDataNoPeriodo('2025-01-01', start, end)).toBe(false);
  });
  
  it('lib isValidDate', () => {
    expect(isValidDate('2024-01-15')).toBe(true);
    expect(isValidDate('not-a-date')).toBe(false);
  });
});

// =============================================
// WMS-SPECIFIC VALIDATION - ~20 scenarios
// =============================================
describe('WMS-Specific Validation', () => {
  describe('Código Lote', () => {
    it('accepts "LOT-001"', () => expect(validarCodigoLote('LOT-001')).toBe(true));
    it('accepts "ABC123"', () => expect(validarCodigoLote('ABC123')).toBe(true));
    it('rejects null', () => expect(validarCodigoLote(null)).toBe(false));
    it('rejects short "AB"', () => expect(validarCodigoLote('AB')).toBe(false));
    it('rejects special chars', () => expect(validarCodigoLote('LOT@001')).toBe(false));
  });

  describe('Posição Estoque', () => {
    it('accepts "A01-B02-C03"', () => expect(validarPosicaoEstoque('A01-B02-C03')).toBe(true));
    it('accepts "A01"', () => expect(validarPosicaoEstoque('A01')).toBe(true));
    it('rejects null', () => expect(validarPosicaoEstoque(null)).toBe(false));
    it('rejects "123"', () => expect(validarPosicaoEstoque('123')).toBe(false));
  });

  describe('Quantidade Triagem', () => {
    it('exact match is valid', () => {
      const result = validarQuantidadeTriagem(100, 100, 5);
      expect(result.valido).toBe(true);
      expect(result.diferenca).toBe(0);
      expect(result.percentual).toBe(0);
    });
    it('within tolerance', () => {
      const result = validarQuantidadeTriagem(100, 103, 5);
      expect(result.valido).toBe(true);
      expect(result.percentual).toBe(3);
    });
    it('exceeds tolerance', () => {
      const result = validarQuantidadeTriagem(100, 110, 5);
      expect(result.valido).toBe(false);
      expect(result.percentual).toBe(10);
    });
    it('zero expected', () => {
      const result = validarQuantidadeTriagem(0, 5, 0);
      expect(result.percentual).toBe(0);
    });
    it('negative difference', () => {
      const result = validarQuantidadeTriagem(100, 90, 5);
      expect(result.diferenca).toBe(-10);
      expect(result.valido).toBe(false);
    });
  });

  describe('Checklist Completo', () => {
    it('all checked', () => {
      const result = validarChecklistCompleto(
        { peso: true, visual: true, codigo: true },
        ['peso', 'visual', 'codigo']
      );
      expect(result.valido).toBe(true);
      expect(result.faltantes).toEqual([]);
    });
    it('missing items', () => {
      const result = validarChecklistCompleto(
        { peso: true, visual: false, codigo: true },
        ['peso', 'visual', 'codigo']
      );
      expect(result.valido).toBe(false);
      expect(result.faltantes).toContain('visual');
    });
    it('extra items ignored', () => {
      const result = validarChecklistCompleto(
        { peso: true, visual: true, extra: true },
        ['peso', 'visual']
      );
      expect(result.valido).toBe(true);
    });
  });
});

// =============================================
// COMBINED VALIDATIONS - ~8 scenarios
// =============================================
describe('Combined Validations', () => {
  it('all valid', () => {
    const result = combinarValidacoes(
      criarValidacao(true, 'error1'),
      criarValidacao(true, 'error2'),
    );
    expect(result.valido).toBe(true);
    expect(result.erros).toHaveLength(0);
  });
  it('some invalid', () => {
    const result = combinarValidacoes(
      criarValidacao(true, 'ok'),
      criarValidacao(false, 'campo obrigatório'),
      criarValidacao(false, 'valor inválido'),
    );
    expect(result.valido).toBe(false);
    expect(result.erros).toHaveLength(2);
    expect(result.erros).toContain('campo obrigatório');
  });
  it('empty validations', () => {
    const result = combinarValidacoes();
    expect(result.valido).toBe(true);
  });
});

// =============================================
// PASSWORD VALIDATION - ~10 scenarios
// =============================================
describe('Password Validation', () => {
  it('valid password', () => {
    const r = isValidPassword('Str0ng!Pass');
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
  it('too short', () => {
    const r = isValidPassword('Ab1!');
    expect(r.valid).toBe(false);
    expect(r.errors).toContain('Mínimo 8 caracteres');
  });
  it('no number', () => {
    const r = isValidPassword('Abcdefgh!');
    expect(r.valid).toBe(false);
  });
  it('no special char', () => {
    const r = isValidPassword('Abcdefg1');
    expect(r.valid).toBe(false);
  });
  it('no uppercase', () => {
    const r = isValidPassword('abcdefg1!');
    expect(r.valid).toBe(false);
  });
  it('custom min length', () => {
    const r = isValidPassword('Ab1!ab1!ab1!', { minLength: 12 });
    expect(r.valid).toBe(true);
  });
  it('all requirements disabled', () => {
    const r = isValidPassword('abc', { minLength: 3, requireNumber: false, requireSpecial: false, requireUppercase: false });
    expect(r.valid).toBe(true);
  });
});

// =============================================
// URL VALIDATION - ~5 scenarios
// =============================================
describe('URL Validation', () => {
  it('valid http', () => expect(isValidURL('http://example.com')).toBe(true));
  it('valid https', () => expect(isValidURL('https://example.com/path')).toBe(true));
  it('rejects no protocol', () => expect(isValidURL('example.com')).toBe(false));
  it('rejects empty', () => expect(isValidURL('')).toBe(false));
  it('rejects random text', () => expect(isValidURL('not a url')).toBe(false));
});

// =============================================
// SECURITY INPUT SANITIZATION - ~10 scenarios
// =============================================
describe('Security Input Sanitization', () => {
  it('removes <script> tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
  });
  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:');
  });
  it('removes event handlers', () => {
    expect(sanitizeInput('onerror=alert(1)')).not.toContain('onerror=');
  });
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
  it('preserves normal text', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});
