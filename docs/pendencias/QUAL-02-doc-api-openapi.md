# QUAL-02 — Documentação de API (Swagger/OpenAPI) para Edge Functions
- **Origem:** src/docs/REPORTE_AUDITORIA_ENTERPRISE.md — único item pendente explícito da "certificação 10/10" (91 linhas).
- **Estado real (20/11/2026):** sem OpenAPI/collection publicada no repo para as 100 functions deployadas; docs/ e supabase/functions/ não têm spec central.
- **O que falta:** gerar spec OpenAPI ("openapi.json"/"openapi.yaml") cobrindo as 100 functions (paths + schemas básicos) ou estrutura de collection; publicar em docs/. Não altera runtime.
- **Camadas:** documentação (sem runtime/banco).
- **Raio de impacto:** integração/consumo externo e onboard; zero impacto em funcionalidade.
- **Critério de aceite:** spec versionada no repo com 100 paths; renderização válida; CI continua verde.
- **Bloqueio:** nenhum.
- **Estado:** AGUARDANDO EXECUÇÃO.