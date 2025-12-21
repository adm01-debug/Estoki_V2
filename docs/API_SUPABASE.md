# API Supabase Edge Functions - ESTOKI

## Visão Geral

O ESTOKI utiliza Supabase Edge Functions para lógica server-side.

## Edge Functions Disponíveis

### 1. scanner-ocr

**Endpoint**: `POST /functions/v1/scanner-ocr`

**Descrição**: Processa imagens de códigos de barras/QR usando OCR.

**Request**:
```json
{
  "image": "base64_encoded_image",
  "type": "barcode" | "qrcode"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "code": "7891234567890",
    "confidence": 0.95
  }
}
```

### 2. alerta-divergencia-fornecedor

**Endpoint**: `POST /functions/v1/alerta-divergencia-fornecedor`

**Descrição**: Envia alertas para fornecedores sobre divergências.

**Request**:
```json
{
  "fornecedor_id": "uuid",
  "divergencias": [
    {
      "tipo": "quantidade",
      "esperado": 100,
      "recebido": 95
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "alerta_id": "uuid",
  "enviado_em": "2025-01-01T00:00:00Z"
}
```

### 3. gerar-desafios-diarios

**Endpoint**: `POST /functions/v1/gerar-desafios-diarios`

**Descrição**: Gera desafios diários para gamificação.

**Request**:
```json
{
  "user_id": "uuid",
  "data": "2025-01-01"
}
```

**Response**:
```json
{
  "success": true,
  "desafios": [
    {
      "id": "uuid",
      "tipo": "triagens_quantidade",
      "meta": 20,
      "xp_recompensa": 50
    }
  ]
}
```

### 4. previsao-demanda

**Endpoint**: `POST /functions/v1/previsao-demanda`

**Descrição**: IA para previsão de demanda de produtos.

**Request**:
```json
{
  "produto_id": "uuid",
  "periodo_dias": 30
}
```

**Response**:
```json
{
  "success": true,
  "previsao": {
    "demanda_estimada": 150,
    "confianca": 0.85,
    "tendencia": "alta"
  }
}
```

## Autenticação

Todas as Edge Functions requerem JWT token:

```typescript
const { data } = await supabase.functions.invoke("nome-funcao", {
  body: { /* payload */ },
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
});
```

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| scanner-ocr | 60/min |
| alerta-divergencia | 10/min |
| gerar-desafios | 5/min |
| previsao-demanda | 30/min |

## Erros Comuns

| Código | Descrição |
|--------|-----------|
| 401 | Token inválido |
| 429 | Rate limit excedido |
| 500 | Erro interno |

## Desenvolvimento Local

```bash
# Iniciar Supabase local
supabase start

# Servir function específica
supabase functions serve scanner-ocr

# Deploy
supabase functions deploy scanner-ocr
```

