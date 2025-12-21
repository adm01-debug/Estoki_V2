# API Documentation

## Endpoints

### Posições
- GET /posicoes - Lista todas as posições
- GET /posicoes/:id - Detalhes de uma posição
- PUT /posicoes/:id - Atualiza uma posição

### Triagens
- GET /triagens - Lista triagens
- POST /triagens - Cria nova triagem
- PUT /triagens/:id - Atualiza triagem

### Recebimentos
- GET /recebimentos - Lista recebimentos
- POST /recebimentos - Cria novo recebimento

### Movimentações
- GET /movimentacoes - Lista movimentações
- POST /movimentacoes - Cria movimentação

## Autenticação

Todas as requisições requerem token JWT no header:
```
Authorization: Bearer <token>
```

## Rate Limiting

- 100 requisições por minuto por usuário
- 1000 requisições por hora por IP
