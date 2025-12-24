# Error Handling - ESTOKI WMS

## Estratégia

### Client-Side
- Error Boundaries para componentes
- Toast notifications para erros de usuário
- Sentry para tracking

### Server-Side
- Try/catch em Edge Functions
- Códigos de erro padronizados
- Logging estruturado

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| E001 | Autenticação falhou |
| E002 | Permissão negada |
| E003 | Recurso não encontrado |
| E004 | Validação falhou |
| E005 | Erro interno |
