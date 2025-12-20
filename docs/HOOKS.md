# Documentação dos Hooks

O ESTOKI possui 34 hooks customizados que encapsulam toda a lógica de negócio e acesso a dados.

## Hooks de Dados

### useEstoque
```typescript
const { 
  posicoes,           // PosicaoEstoque[]
  loading,            // boolean
  error,              // string | null
  getEstatisticas,    // () => EstatisticasEstoque
  atualizarPosicao,   // (id, data) => Promise
  criarPosicao,       // (data) => Promise
  refetch             // () => void
} = useEstoque();
```

### useRecebimentos
```typescript
const {
  recebimentos,        // Recebimento[]
  loading,
  atualizarRecebimento,
  finalizarConferencia,
} = useRecebimentos();
```

### useTriagens
```typescript
const {
  triagens,
  loading,
  getTriagemById,
  finalizarTriagem,
  atualizarProgresso,
} = useTriagens();
```

### useMovimentacoes
```typescript
const {
  movimentacoes,
  loading,
  registrarMovimentacao,
  buscarPorPeriodo,
} = useMovimentacoes();
```

### useKPIsOperacionais
```typescript
const {
  metricas,
  metas,
  kpisConsolidados,
  evolucaoDiaria,
  salvarMeta,
  excluirMeta,
  getKPIStatus,
  calcularVariacao,
} = useKPIsOperacionais(dias);
```

## Hooks de Funcionalidade

### useScanner
```typescript
const {
  isScanning,
  isLoading,
  lastResult,
  scanHistory,
  error,
  processQRCode,
  clearLastResult,
  setScanning,
} = useScanner();
```

### useBalanca
```typescript
const {
  conectada,
  leitura,
  suportado,
  conectar,
  desconectar,
  erro,
} = useBalanca();
```

### useTriagemTimer
```typescript
const {
  tempoDecorrido,
  tempoFormatado,
  iniciado,
  pausado,
  iniciar,
  pausar,
  retomar,
  parar,
  reset,
} = useTriagemTimer();
```

### useBulkActions
```typescript
const {
  selectedIds,
  selectedItems,
  allSelected,
  someSelected,
  toggleItem,
  toggleAll,
  clearSelection,
  executeAction,
} = useBulkActions(items);
```

## Hooks de Gamificação

### useGamificacao
```typescript
const {
  usuario,
  nivel,
  xp,
  adicionarXp,
  loading,
} = useGamificacao();
```

### useConquistas
```typescript
const {
  conquistas,
  conquistasRecentes,
  verificarConquista,
} = useConquistas();
```

### useDesafiosDiarios
```typescript
const {
  desafios,
  desafiosConcluidos,
  xpDisponivel,
  atualizarProgresso,
  coletarRecompensa,
  gerarDesafios,
} = useDesafiosDiarios();
```

### useStreaks
```typescript
const {
  streakAtual,
  melhorStreak,
  registrarAtividade,
} = useStreaks();
```

## Hooks de Infraestrutura

### useRealtimeKPIs
```typescript
useRealtimeKPIs({
  onMetricUpdate: () => {},
  onPositionUpdate: () => {},
  onTriageUpdate: () => {},
  onPickingUpdate: () => {},
});
```

### useKPIAlerts
```typescript
const {
  criticalAlerts,
  warningAlerts,
  hasCriticalAlerts,
  checkKPIs,
} = useKPIAlerts({ enabled, soundEnabled });
```

### useNotificacoes
```typescript
const {
  notificacoes,
  naoLidas,
  marcarComoLida,
  limparTodas,
} = useNotificacoes();
```

## Boas Práticas

1. **Sempre use hooks para acessar dados**
   - Nunca acesse Supabase diretamente nas páginas

2. **Aproveite o cache do TanStack Query**
   - Evite chamadas duplicadas
   - Use invalidação quando necessário

3. **Trate estados de loading e error**
   - Sempre verifique `loading` antes de renderizar dados
   - Exiba mensagens de erro amigáveis

4. **Use TypeScript corretamente**
   - Importe os tipos dos hooks
   - Não use `any` desnecessariamente
