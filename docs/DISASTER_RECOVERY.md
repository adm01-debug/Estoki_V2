# Plano de Recuperação de Desastres (DRP) — ESTOKI WMS

## Objetivos (RTO/RPO)
- **RTO (Recovery Time Objective):** 4 horas
- **RPO (Recovery Point Objective):** 24 horas (backups diários)

## Estratégias de Backup
1. **Banco de Dados (Supabase):**
   - Backup automático diário gerenciado pelo Supabase.
   - Snapshots manuais via Edge Function `backup-database` semanalmente.
2. **Storage:**
   - Versionamento habilitado nos buckets críticos.
3. **Código e Configuração:**
   - IaC (Terraform) para recriação rápida da infraestrutura.
   - Repositório GitHub com proteção de branch.

## Procedimento de Recuperação
1. Identificação do incidente.
2. Acionamento da equipe de DevOps.
3. Restauração do último backup íntegro.
4. Redecploy das Edge Functions via CLI.
5. Validação de integridade de dados.

## Contatos de Emergência
- Administrador Supabase: admin@estoki.com.br
- Lead Developer: dev@estoki.com.br
