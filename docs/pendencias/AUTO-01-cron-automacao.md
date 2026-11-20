# AUTO-01 — Produção sem automação agendada (cron.job = 0)

- **Origem:** ESTADO_ATUAL.md 🔴3 (audit: 1 job update-profile-nome-daily-v3; 16/08/2026).
- **Estado real (20/11/2026):** cron.job retorna **0 jobs** em produção. Existem 10+ funções de alerta/rotina deployadas: alert-expiration, alert-monitor, alert-pending-orders, alert-productivity, alert-quality, alert-sla-breach, alert-stock-low, check-expiration, cron-daily, cron-weekly, cleanup-old-data, cleanup-sessions, db-alert-monitor. Nenhuma está agendada.
- **O que falta:** decisão de quais agendamentos sobem (job + trigger) e com qual cadência; revisar payload/campos antes de criar cron. Migration aditiva.
- **Camadas:** banco (pg_cron), edge functions.
- **Raio de impacto:** se ligar tudo junto, volume de alertas/notificações; nenhum dado existente é alterado.
- **Critério de aceite:** crons documentados e ativos com verificação de execução (job log), sem regressão de funcionalidade manual existente.
- **Bloqueio:** decisão de negócio (quais alertas ligar; produção vazia hoje).
- **Estado:** AGUARDANDO DECISÃO.
