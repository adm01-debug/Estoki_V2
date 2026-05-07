import React from 'react';
import { Crown, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getPosicaoIcon = (posicao: number) => {
  switch (posicao) {
    case 1:
      return React.createElement(Crown, { className: "h-6 w-6 text-yellow-500" });
    case 2:
      return React.createElement(Medal, { className: "h-5 w-5 text-gray-400" });
    case 3:
      return React.createElement(Medal, { className: "h-5 w-5 text-amber-600" });
    default:
      return React.createElement('span', { className: "text-muted-foreground font-bold" }, `${posicao}º`);
  }
};

export const getTendenciaIcon = (posicaoAtual: number, posicaoAnterior?: number) => {
  if (!posicaoAnterior) {
    return React.createElement('div', { className: "flex items-center text-muted-foreground" }, 
      React.createElement(Minus, { className: "h-4 w-4" })
    );
  }

  const diff = posicaoAnterior - posicaoAtual;
  if (diff > 0) {
    return React.createElement('div', { className: "flex items-center gap-1 text-green-500" }, 
      React.createElement(TrendingUp, { className: "h-4 w-4" }),
      React.createElement('span', { className: "text-xs" }, `+${diff}`)
    );
  } else if (diff < 0) {
    return React.createElement('div', { className: "flex items-center gap-1 text-red-500" }, 
      React.createElement(TrendingDown, { className: "h-4 w-4" }),
      React.createElement('span', { className: "text-xs" }, `${diff}`)
    );
  }
  return React.createElement('div', { className: "flex items-center text-muted-foreground" }, 
    React.createElement(Minus, { className: "h-4 w-4" })
  );
};

export const getInitials = (nome: string) => {
  return nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const getPodiumColor = (posicao: number) => {
  switch (posicao) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950';
    case 3:
      return 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950';
    default:
      return 'bg-muted';
  }
};
