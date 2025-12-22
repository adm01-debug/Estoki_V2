# 🔌 API Endpoints - ESTOKI

## Autenticação

Todas as requisições requerem o header:
```
Authorization: Bearer <token>
```

## Edge Functions

### POST /functions/v1/calculate-kpis
Calcula KPIs operacionais do dia.

**Response:**
```json
{
  "triagens_dia": 15,
  "total_posicoes": 100,
  "posicoes_ocupadas": 75,
  "taxa_ocupacao": "75.00"
}
```

### POST /functions/v1/generate-report
Gera relatórios customizados.

**Request:**
```json
{
  "tipo": "triagem|estoque|movimentacao",
  "data_inicio": "2024-01-01",
  "data_fim": "2024-12-31"
}
```

### POST /functions/v1/gerar-desafios-diarios
Gera desafios do dia (cron).

### POST /functions/v1/previsao-demanda
Calcula previsão de demanda.

**Request:**
```json
{
  "produto_id": "uuid",
  "periodo_dias": 30
}
```

### POST /functions/v1/scanner-ocr
Extrai texto de imagem.

**Request:** FormData com arquivo de imagem

### POST /functions/v1/notify-slack
Envia notificação para Slack.

**Request:**
```json
{
  "channel": "#estoki-alerts",
  "message": "Alerta de estoque baixo",
  "tipo": "alerta",
  "dados": {}
}
```

## Tabelas Supabase (REST)

Base URL: `https://<project>.supabase.co/rest/v1/`

### Posições
- `GET /posicoes_estoque` - Listar
- `POST /posicoes_estoque` - Criar
- `PATCH /posicoes_estoque?id=eq.<id>` - Atualizar
- `DELETE /posicoes_estoque?id=eq.<id>` - Remover

### Lotes
- `GET /lotes` - Listar
- `POST /lotes` - Criar
- `PATCH /lotes?id=eq.<id>` - Atualizar

### Triagens
- `GET /eventos_triagem` - Listar eventos
- `POST /eventos_triagem` - Criar evento

### Gamificação
- `GET /gamificacao_usuarios` - Ranking
- `GET /desafios_diarios?data=eq.<date>` - Desafios do dia
- `POST /xp_historico` - Registrar XP

## Realtime

Subscribir a mudanças:
```javascript
supabase
  .channel('changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'lotes' },
    payload => console.log(payload)
  )
  .subscribe()
```

## Rate Limiting

- 100 requisições/minuto por usuário
- 1000 requisições/hora por projeto

---
*Documentação atualizada em Dezembro 2025*
