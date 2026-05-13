import { describe, it, expect } from 'vitest';
import { 
  produtoSchema, 
  movimentacaoSchema,
  validateForm 
} from '../lib/validations';

describe('validations', () => {
  describe('produtoSchema', () => {
    it('deve validar um produto correto', () => {
      const data = {
        sku: 'SKU-001',
        nome: 'Produto Teste',
        unidade: 'UN',
        estoque_minimo: 10,
        estoque_maximo: 50,
        ponto_pedido: 20
      };
      const result = validateForm(produtoSchema, data);
      expect(result.success).toBe(true);
    });

    it('deve falhar se SKU for inválido', () => {
      const data = {
        sku: 'SKU @ Invalid',
        nome: 'Produto Teste',
        unidade: 'UN',
        estoque_minimo: 10,
        estoque_maximo: 50,
        ponto_pedido: 20
      };
      const result = validateForm(produtoSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.sku).toBeDefined();
      }
    });

    it('deve falhar se estoque_minimo > estoque_maximo', () => {
      const data = {
        sku: 'SKU-001',
        nome: 'Produto Teste',
        unidade: 'UN',
        estoque_minimo: 100,
        estoque_maximo: 50,
        ponto_pedido: 20
      };
      const result = validateForm(produtoSchema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('movimentacaoSchema', () => {
    it('deve validar tipos de movimentação permitidos', () => {
      const data = {
        tipo: 'armazenamento',
        quantidade: 10,
        descricao: 'Teste de armazenamento'
      };
      expect(movimentacaoSchema.safeParse(data).success).toBe(true);
    });

    it('deve falhar para tipo inválido', () => {
      const data = {
        tipo: 'venda', // Não existe no enum
        quantidade: 10,
        descricao: 'Teste'
      };
      expect(movimentacaoSchema.safeParse(data).success).toBe(false);
    });
  });
});
