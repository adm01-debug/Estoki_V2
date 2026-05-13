 # 🚀 Escalabilidade e Infraestrutura — ESTOKI WMS
 
 ## Estratégia de Crescimento
 
 O ESTOKI WMS foi desenhado para escalar horizontalmente, aproveitando a infraestrutura serverless da Lovable Cloud e do Supabase.
 
 ### 1. Database (Supabase / Postgres)
 
 - **Read Replicas**: Configuração disponível para ambientes Enterprise para isolar tráfego de relatórios de tráfego operacional.
 - **Connection Pooling**: Uso do PgBouncer para suportar milhares de conexões simultâneas de Edge Functions.
 - **Indexing**: Manutenção automática de índices GIN para busca textual e B-Tree para IDs/Timestamps.
 - **Partitioning**: Tabelas de logs (`audit_log`, `telemetria`) são particionadas por mês.
 
 ### 2. Edge Computing
 
 - **Regional Deploy**: Edge Functions rodam próximas ao usuário para latência mínima.
 - **Auto-scaling**: Capacidade de processamento escala de 0 a centenas de instâncias simultâneas conforme demanda.
 - **Isolação**: Cada request roda em um Isolate seguro (V8), garantindo que um cliente não afete outro.
 
 ### 3. Assets e Content Delivery (CDN)
 
 - **Edge Caching**: Assets estáticos (JS, CSS, Imagens) são servidos via CDN global com TTL de 1 ano (versão via hash).
 - **Image Optimization**: Imagens de produtos/triagem são processadas on-the-fly para reduzir o payload mobile.
 
 ### 4. Limites Atuais e Planejamento
 
 | Recurso | Limite Atual (Standard) | Próximo Nível (Pro) |
 |---|---|---|
 | Banco de Dados | 8GB | 50GB+ |
 | Edge Function Invokes | 2M / mês | Ilimitado |
 | Realtime Connections | 500 | 10.000+ |
 | Storage | 5GB | 100GB+ |
 
 ### 5. Disaster Recovery
 
 - **Backups**: Diários automáticos com retenção de 30 dias.
 - **PITR**: Point-in-time recovery habilitado para reversão de falhas críticas.
 - **Multi-region**: Possibilidade de failover para região secundária em caso de outage global da AWS/Supabase.
