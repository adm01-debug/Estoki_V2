import { Decimal } from 'decimal.js';

export const toDecimal = (val: number | string): Decimal => new Decimal(val);

export const formatMoney = (val: number | Decimal): string => {
  const num = Decimal.isDecimal(val) ? val.toNumber() : val;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

export const addMoney = (a: number, b: number): number => {
  return new Decimal(a).plus(b).toNumber();
};

export const multiplyMoney = (a: number, b: number): number => {
  return new Decimal(a).times(b).toNumber();
};
