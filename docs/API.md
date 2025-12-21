# Documentação de API - ESTOKI

## Edge Functions (Supabase)

### scanner-ocr
Processa imagens para extrair texto e dados estruturados.

**Endpoint:** `supabase.functions.invoke('scanner-ocr')`

**Payload:**
```typescript
{
  image: string;       // Base64 da imagem
  extractData: boolean; // Se deve extrair dados estruturados
}
```

**Resposta:**
```typescript
{
  text: string;
  confidence: number;
  extractedData: {
    pedido?: string;
    lote?: string;
    quantidade?: number;
    produto?: string;
  };
}
```

### alerta-divergencia-fornecedor
Envia alertas de divergência para fornecedores.

**Endpoint:** `supabase.functions.invoke('alerta-divergencia-fornecedor')`

**Payload:**
```typescript
{
  fornecedor: string;
  divergencias: Array<{
    lote: string;
    produto: string;
    pedido: number;
    recebido: number;
    diferenca: number;
    tipo: 'falta' | 'sobra';
    data: string;
  }>;
  metricas: {
    total: number;
    faltas: number;
    sobras: number;
    valorTotal: number;
  };
}
```

### gerar-desafios-diarios
Gera desafios diários para operadores.

**Endpoint:** `supabase.functions.invoke('gerar-desafios-diarios')`

### previsao-demanda
Gera previsões de demanda usando IA.

**Endpoint:** `supabase.functions.invoke('previsao-demanda')`

## Tabelas Supabase

### lotes
Armazena informações de lotes recebidos.

### triagens
Registra triagens realizadas.

### posicoes_estoque
Mapeia posições do armazém.

### estoque_posicao
Relaciona lotes com posições.

### notificacoes
Sistema de notificações.

### profiles
Perfis de usuários com gamificação.
