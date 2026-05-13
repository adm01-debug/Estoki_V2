 # 📊 Queue System — ESTOKI WMS
 
 ## Arquitetura de Filas
 
 O sistema utiliza uma arquitetura de filas baseada em Supabase Edge Functions e tabelas de processamento assíncrono para garantir a resiliência e escalabilidade de operações pesadas ou integrações externas.
 
 ### 1. Tipos de Jobs
 
 | Categoria | Descrição | Exemplo |
 |---|---|---|
 | **Integrações** | Chamadas a APIs externas | Rastreio Correios, Sync Bitrix24 |
 | **Relatórios** | Geração de arquivos pesados | Exportação Excel (50k+ linhas), PDFs |
 | **Fiscal** | Processamento de documentos | Validação XML NF-e, Emissão |
 | **Notificações** | Disparos em massa | E-mails de marketing, Alertas SMS |
 
 ### 2. Fluxo de Processamento
 
 1. **Dispatch**: O cliente ou um trigger de banco insere um registro na tabela `queue_jobs`.
 2. **Trigger**: Um webhook chama a Edge Function `queue-process`.
 3. **Execution**: A função executa a lógica e atualiza o status para `completed` ou `failed`.
 4. **Retry Logic**: Jobs com falha são reprocessados automaticamente até 3 vezes com backoff exponencial.
 
 ### 3. Monitoramento
 
 - Tabela: `public.queue_jobs`
 - Campos: `id`, `type`, `payload`, `status` (pending, processing, completed, failed), `error_log`, `attempts`.
 - Logs: Disponíveis no Supabase Dashboard em "Edge Function Logs".
 
 ### 4. Edge Functions Relacionadas
 
 | Função | Responsabilidade |
 |---|---|
 | `queue-add` | Adiciona um novo job à fila com validação de payload. |
 | `queue-process` | Worker central que distribui jobs para processadores específicos. |
 | `queue-retry` | Varredura periódica para reiniciar jobs "stuck" ou falhos. |
 | `cron-daily` | Executa limpezas e rotinas pesadas fora do horário de pico. |
 
 ### 5. Dead-Letter Queue (DLQ)
 
 Jobs que excedem o limite de tentativas são movidos para `queue_dead_letter` para análise manual dos administradores.
