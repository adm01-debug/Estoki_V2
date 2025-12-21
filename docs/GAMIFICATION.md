# Sistema de Gamificação - ESTOKI

## Visão Geral

O sistema de gamificação incentiva produtividade e engajamento dos operadores através de:

- 🏆 Conquistas (Achievements)
- 🎯 Desafios Diários
- 🔥 Streaks (Sequências)
- 📊 Ranking/Placar de Líderes
- ⭐ Sistema de XP e Níveis

## Conquistas

### Categorias

| Categoria | Descrição |
|-----------|-----------|
| Produtividade | Metas de quantidade |
| Qualidade | Precisão e acurácia |
| Consistência | Manter streaks |
| Especial | Eventos e marcos |

### Exemplos de Conquistas

```typescript
const conquistas = [
  {
    id: "primeira_triagem",
    nome: "Primeira Triagem",
    descricao: "Complete sua primeira triagem",
    xp: 50,
    icone: "🎉"
  },
  {
    id: "mestre_triagem",
    nome: "Mestre da Triagem",
    descricao: "Complete 1000 triagens",
    xp: 500,
    icone: "🏆"
  }
];
```

## Desafios Diários

Gerados automaticamente pela Edge Function `gerar-desafios-diarios`:

```typescript
const desafiosTipos = [
  "triagens_quantidade",    // X triagens no dia
  "zero_divergencias",      // Sem erros
  "tempo_recorde",          // Tempo abaixo da média
  "ajudar_colega",          // Colaboração
];
```

## Sistema de XP

### Ganho de XP

| Ação | XP |
|------|-----|
| Triagem concluída | 10 |
| Sem divergências | +5 bonus |
| Tempo recorde | +10 bonus |
| Desafio completo | 25-100 |
| Conquista | 50-500 |

### Níveis

| Nível | XP Necessário | Título |
|-------|---------------|--------|
| 1-5 | 0-500 | Iniciante |
| 6-10 | 501-2000 | Operador |
| 11-20 | 2001-5000 | Especialista |
| 21-30 | 5001-10000 | Mestre |
| 31+ | 10001+ | Lenda |

## Streaks

### Tipos de Streak

- **Diário**: Login + atividade por dia consecutivo
- **Semanal**: Meta semanal atingida
- **Perfeição**: Dias sem divergências

### Multiplicadores

| Streak | Multiplicador XP |
|--------|------------------|
| 3 dias | 1.1x |
| 7 dias | 1.25x |
| 14 dias | 1.5x |
| 30 dias | 2x |

## Ranking

### Categorias

- Diário
- Semanal
- Mensal
- All-time

### Cálculo de Pontuação

```typescript
pontuacao = (triagens * 10) + 
            (qualidade * 20) + 
            (streak_bonus) + 
            (conquistas_xp);
```

## Hooks Relacionados

- `useGamificacao` - Estado geral
- `useConquistas` - Sistema de conquistas
- `useDesafiosDiarios` - Desafios
- `useStreaks` - Sequências
- `useRanking` - Placar de líderes

## Tabelas Supabase

- `gamificacao_usuarios`
- `conquistas_definicoes`
- `conquistas_usuarios`
- `desafios_diarios`
- `desafios_usuarios`
- `streaks_usuarios`
- `xp_historico`

