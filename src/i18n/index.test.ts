import { describe, it, expect } from 'vitest';
import { t, defaultLocale, translations } from './index';

describe('i18n', () => {
  it('should have default locale as pt-BR', () => {
    expect(defaultLocale).toBe('pt-BR');
  });

  it('should translate common keys', () => {
    expect(t('common.save')).toBe('Salvar');
    expect(t('common.cancel')).toBe('Cancelar');
  });

  it('should return key for missing translation', () => {
    expect(t('missing.key')).toBe('missing.key');
  });
});
