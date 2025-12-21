# Integrações - ESTOKI

## Integrações Ativas

### Supabase
- **Uso**: Backend, Auth, Storage
- **Config**: Variáveis de ambiente
- **Docs**: https://supabase.com/docs

### Balança (Serial)
- **Protocolo**: Serial via Web Serial API
- **Modelos**: Toledo, Filizola, Urano
- **Config**: `src/hooks/useBalanca.ts`

## Integrações Planejadas

### ERP
- SAP Business One
- Bling
- Tiny

### E-commerce
- VTEX
- Tray
- Shopify

### Transportadoras
- Correios
- Jadlog
- Total Express

## Como Integrar

1. Criar service em `src/services/`
2. Criar hook em `src/hooks/`
3. Documentar em `docs/`
4. Adicionar testes
