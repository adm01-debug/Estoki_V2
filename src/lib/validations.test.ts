import { describe, it, expect } from 'vitest';
import { movimentacaoSchema, produtoSchema, romaneioSchema, validateForm } from './validations';

describe('validations', () => {
  describe('movimentacaoSchema', () => {
    it('validates a correct payload', () => {
      const data = {
        tipo: 'armazenamento',
        quantidade: 10,
        descricao: 'Teste de movimentação'
      };
      const result = movimentacaoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if quantidade is 0 or negative', () => {
      const result = movimentacaoSchema.safeParse({
        tipo: 'armazenamento',
        quantidade: 0,
        descricao: 'Teste'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('produtoSchema', () => {
    it('validates correct product data', () => {
      const data = {
        sku: 'PRD-001',
        nome: 'Produto Teste',
        unidade: 'UN',
        estoque_minimo: 10,
        estoque_maximo: 100,
        ponto_pedido: 20
      };
      const result = produtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if min > max', () => {
      const data = {
        sku: 'PRD-001',
        nome: 'Produto Teste',
        unidade: 'UN',
        estoque_minimo: 100,
        estoque_maximo: 50,
        ponto_pedido: 20
      };
      const result = produtoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('returns extractable errors on failure', () => {
      const data = { tipo: 'invalid' };
      const result = validateForm(movimentacaoSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });
  });
});