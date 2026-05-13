import { describe, it, expect } from 'vitest';
import { 
  getFaixaLote, 
  calcularAmostraRaizQuadrada, 
  calcularAmostraAQL, 
  getCriteriosAceite 
} from '../components/triagem/amostragemUtils';

describe('amostragemUtils', () => {
  describe('getFaixaLote', () => {
    it('deve retornar a faixa correta para diferentes tamanhos de lote', () => {
      expect(getFaixaLote(5)).toBe('2-8');
      expect(getFaixaLote(15)).toBe('9-15');
      expect(getFaixaLote(100)).toBe('91-150');
      expect(getFaixaLote(5000)).toBe('3201-10000');
    });
  });

  describe('calcularAmostraRaizQuadrada', () => {
    it('deve calcular a raiz quadrada corretamente com limites', () => {
      // sqrt(100) = 10
      expect(calcularAmostraRaizQuadrada(100)).toBe(10);
      // sqrt(25) = 5
      expect(calcularAmostraRaizQuadrada(25)).toBe(5);
    });

    it('deve respeitar o mínimo de 5 ou o tamanho do lote', () => {
      expect(calcularAmostraRaizQuadrada(2)).toBe(2);
      expect(calcularAmostraRaizQuadrada(4)).toBe(4);
    });
  });

  describe('calcularAmostraAQL', () => {
    it('deve retornar os valores corretos da tabela AQL', () => {
      // Lote 100 -> Faixa 91-150 -> Normal: 20, Rigoroso: 32, Reduzido: 8
      expect(calcularAmostraAQL(100, 'normal')).toBe(20);
      expect(calcularAmostraAQL(100, 'rigoroso')).toBe(32);
      expect(calcularAmostraAQL(100, 'reduzido')).toBe(8);
    });
  });

  describe('getCriteriosAceite', () => {
    it('deve retornar critérios de aceite/rejeite baseados no tamanho da amostra', () => {
      // Amostra 13 -> Aceite: 1, Rejeite: 2
      expect(getCriteriosAceite(13)).toEqual({ aceite: 1, rejeite: 2 });
      // Amostra 80 -> Aceite: 5, Rejeite: 6
      expect(getCriteriosAceite(80)).toEqual({ aceite: 5, rejeite: 6 });
    });

    it('deve aproximar para o tamanho de amostra mais próximo', () => {
      expect(getCriteriosAceite(14)).toEqual({ aceite: 1, rejeite: 2 });
    });
  });
});
