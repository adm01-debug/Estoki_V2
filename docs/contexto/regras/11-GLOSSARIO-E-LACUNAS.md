# 11 · GLOSSÁRIO, DADOS DE REFERÊNCIA E LACUNAS

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `f06b8d0e1b` · branch `main` · 2026-11-14 12:40 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## Glossário do domínio (entidades do sistema)

| Termo | Significado / valores | Tamanho | Origem |
|---|---|---|---|
| `agv_devices` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `agv_missions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `ajustes_estoque` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `alertas_config` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `alertas_historico` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `analytics_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `aprovacoes_movimentacao` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `armazens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `audit_log` | Dedicated audit log table for tracking all system events | 14 colunas | migration |
| `categorias` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `checkpoints_zona` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `clientes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 19 colunas | migration |
| `comprovantes_entrega` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `conquistas_definicoes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `conquistas_usuarios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `custodia_transferencias` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `db_health_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `desafios_diarios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `desafios_usuarios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `entity_versions` | Histórico de versões de todas as entidades | 12 colunas | migration |
| `estoque_posicao` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `eventos_picking` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `eventos_triagem` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `feature_flags` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `fornecedor_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `gamificacao_loja` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `gamificacao_transacoes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `gamificacao_usuarios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `geo_whitelist` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `import_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `inspecoes_qualidade` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `inventario_ciclos` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `inventario_config` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `inventario_contagens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 22 colunas | migration |
| `inventory_count_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `inventory_counts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `inventory_lots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `ip_whitelist` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | types.ts |
| `job_queue` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `locations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `login_attempts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `login_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | types.ts |
| `lot_movements` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `lotes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 20 colunas | migration |
| `metas_kpi` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `metricas_dashboard` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `metricas_operacionais` | _(sem COMMENT ON TABLE — significado não documentado)_ | 22 colunas | migration |
| `mv_alertas_severidade` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | types.ts |
| `mv_audit_daily` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | types.ts |
| `mv_notificacoes_tipo` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | types.ts |
| `nfe_documents` | _(sem COMMENT ON TABLE — significado não documentado)_ | 23 colunas | migration |
| `nfe_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `notificacoes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `ocorrencias_perda` | _(sem COMMENT ON TABLE — significado não documentado)_ | 20 colunas | migration |
| `ondas_separacao` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `order_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `orders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `passkey_credentials` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `password_reset_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `permissions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `pick_orders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `posicao_status_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `posicoes_estoque` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `products` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `produtividade_operador` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `produtos` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `profiles` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `purchase_orders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `putaway_orders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `quality_inspections` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `query_telemetry` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `rastreamento_historico` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `recebimentos` | _(sem COMMENT ON TABLE — significado não documentado)_ | 21 colunas | migration |
| `receiving_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `receivings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `recuperacao_materiais` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `regras_ponto_pedido` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `relatorios_agendados` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `role_permissions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `romaneio_itens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `romaneios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 20 colunas | migration |
| `saved_filters` | Filtros salvos pelos usuários para reutilização | 7 colunas | migration |
| `serial_numbers` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `setores_checkpoint` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `stock_movements` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `stock_reservations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `streaks_historico` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `streaks_usuarios` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `tarefas` | _(sem COMMENT ON TABLE — significado não documentado)_ | 23 colunas | migration |
| `tenant_members` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `tenants` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `triagens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 24 colunas | migration |
| `trocas_devolucoes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 24 colunas | migration |
| `user_devices` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | types.ts |
| `user_roles` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `webauthn_challenges` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `xp_historico` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `app_role` (enum) | operador, supervisor, admin |  | banco |
| `status_ciclo_inventario` (enum) | agendado, em_andamento, concluido, cancelado |  | banco |
| `status_contagem` (enum) | pendente, em_andamento, concluido, divergencia |  | banco |
| `tipo_posicao` (enum) | porta_palete, box |  | banco |
| `status_posicao` (enum) | livre, ocupado, reservado, bloqueado |  | banco |
| `status_onda` (enum) | pendente, em_andamento, concluida, cancelada |  | banco |
| `status_tarefa` (enum) | pendente, atribuida, em_andamento, concluida, bloqueada, cancelada, atrasada |  | banco |
| `tipo_tarefa` (enum) | separacao, armazenagem, transferencia, inventario, expedicao, recebimento, triagem, manutencao |  | banco |
| `prioridade_tarefa` (enum) | baixa, media, alta, urgente |  | banco |
| `tipo_alerta` (enum) | estoque_minimo, estoque_maximo, ponto_pedido, posicao_ociosa, vencimento_proximo, gargalo_triagem, divergencia_inventario, item_sem_movimentacao, webhook, sistema |  | banco |
| `severidade_alerta` (enum) | info, aviso, critico, urgente |  | banco |
| `status_alerta` (enum) | ativo, reconhecido, resolvido, ignorado |  | banco |
| `tipo_evento_rastreamento` (enum) | recebimento_nf, conferencia, triagem_inicio, triagem_fim, armazenamento, reserva, separacao, conferencia_expedicao, carregamento, saida_transporte, entrega, devolucao, ajuste_estoque |  | banco |
| `status_romaneio` (enum) | rascunho, confirmado, em_transito, entregue, parcial, cancelado |  | banco |
| `status_entrega` (enum) | pendente, em_rota, entregue, recusado, parcial, reagendado |  | banco |
| `status_recebimento` (enum) | aguardando, em_transito, recebido, em_conferencia, conferido, divergencia, cancelado, quarentena |  | banco |
| `tipo_embalagem` (enum) | original, plastica, generica |  | banco |
| `tipo_registro_td` (enum) | troca, devolucao |  | banco |
| `status_registro_td` (enum) | aberto, em_analise, aprovado, recusado, em_transito, recebido, finalizado |  | banco |
| `motivo_td` (enum) | defeito, cor_errada, tamanho_errado, quantidade_errada, produto_errado, avaria_transporte, desistencia, outro |  | banco |
| `order_status` (enum) | pendente, em_separacao, embalagem, aguardando_transporte, enviado, cancelado |  | banco |
| `tipo_evento_rastreamento_v2` (enum) | recebimento_entrada, triagem_conferencia, armazenamento_pallet, saida_para_gravacao, retorno_da_gravacao, saida_para_manuseio, retorno_do_manuseio, setor_conserto_entrada, setor_conserto_saida, expedicao_saida_conferencia, expedicao_saida_liberado, devolucao_fornecedor, perda_confirmada |  | banco |
| `StatusPosicao` (TS) | livre \| ocupado \| reservado \| bloqueado |  | `src/components/armazenamento/PosicaoStatusBadge.tsx` |
| `StatusRecebimento` (TS) | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado |  | `src/components/conferencia/types.ts` |
| `TipoEmbalagem` (TS) | original \| plastica \| generica |  | `src/components/conferencia/types.ts` |
| `FonteData` (TS) | lotes \| entregas |  | `src/components/etiquetas/types.ts` |
| `TamanhoEtiqueta` (TS) | 10x15 \| 10x7 \| 8x5 |  | `src/components/etiquetas/types.ts` |
| `StatusCiclo` (TS) | planejado \| em_andamento \| concluido \| cancelado |  | `src/components/inventario/StatusCicloCard.tsx` |
| `Trend` (TS) | up \| down \| stable |  | `src/components/kpis/KPITrendIndicator.tsx` |
| `ViewMode` (TS) | rack \| grid \| heatmap |  | `src/components/ocupacao/types.ts` |
| `SortMode` (TS) | codigo \| status \| ocupacao |  | `src/components/ocupacao/types.ts` |
| `UIStatus` (TS) | pendente \| em_analise \| autorizado \| enviado \| concluido \| recusado |  | `src/components/trocas/StatusBadge.tsx` |
| `TrendDirection` (TS) | up \| down \| neutral |  | `src/components/ui/stats-card.tsx` |
| `EventCategory` (TS) | USER = "user", INVENTORY = "inventory", RECEIVING = "receiving", SHIPPING = "shipping", PICKING = "picking", ERROR = "error", PERFORMANCE = "performance", |  | `src/config/analytics.ts` |
| `EventAction` (TS) | // User LOGIN = "login", LOGOUT = "logout", PAGE_VIEW = "page_view", // Inventory STOCK_UPDATE = "stock_update", INVENTORY_COUNT = "inventory_count", LOW_STOCK_ALERT = "low_stock_alert", // Receiving RECEIPT_CREATED = "receipt_created", RECEIPT_COMPLETED = "receipt_completed", // Shipping SHIPMENT_C … |  | `src/config/analytics.ts` |
| `Environment` (TS) | development \| staging \| production |  | `src/config/environment.ts` |
| `ErrorCode` (TS) | NETWORK_ERROR = "NETWORK_ERROR", TIMEOUT = "TIMEOUT", UNAUTHORIZED = "UNAUTHORIZED", FORBIDDEN = "FORBIDDEN", NOT_FOUND = "NOT_FOUND", VALIDATION_ERROR = "VALIDATION_ERROR", SERVER_ERROR = "SERVER_ERROR", UNKNOWN_ERROR = "UNKNOWN_ERROR", OFFLINE = "OFFLINE", RATE_LIMITED = "RATE_LIMITED", |  | `src/config/error-handler.ts` |
| `BARCODE_FORMATS` (TS) | "EAN13", "EAN8", "CODE128", "CODE39", "QR_CODE" |  | `src/constants/app.ts` |
| `UNITS_OF_MEASURE` (TS) | { code: "UN", name: "Unidade", symbol: "un" }, { code: "CX", name: "Caixa", symbol: "cx" }, { code: "PC", name: "Pacote", symbol: "pct" }, { code: "KG", name: "Quilograma", symbol: "kg" }, { code: "MT", name: "Metro", symbol: "m" }, { code: "LT", name: "Litro", symbol: "L" }, |  | `src/constants/app.ts` |
| `ClassificacaoABC` (TS) | A \| B \| C |  | `src/features/analytics/hooks/useCurvaABC.ts` |
| `StatusPosicao` (TS) | livre \| ocupado \| reservado \| bloqueado |  | `src/features/inventory/types/index.ts` |
| `TipoPosicao` (TS) | porta_palete \| box |  | `src/features/inventory/types/index.ts` |
| `MetodoAmostragem` (TS) | raiz_quadrada \| aql_normal \| aql_rigoroso \| aql_reduzido |  | `src/features/quality/components/amostragemUtils.ts` |
| `StatusTriagem` (TS) | em_andamento \| aprovado \| ressalva \| reprovado |  | `src/features/quality/components/formulario/constants.ts` |
| `StatusTriagem` (TS) | em_andamento \| aprovado \| reprovado \| ressalva \| pendente |  | `src/features/quality/types/index.ts` |
| `StatusRecebimento` (TS) | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado |  | `src/features/receiving/types/index.ts` |
| `TipoEmbalagem` (TS) | original \| pallet \| caixa \| unidade |  | `src/features/receiving/types/index.ts` |
| `StatusRomaneio` (TS) | rascunho \| confirmado \| em_transito \| entregue \| parcial \| cancelado |  | `src/features/shipping/types/index.ts` |
| `StatusEntrega` (TS) | pendente \| em_rota \| entregue \| recusado \| parcial \| reagendado |  | `src/features/shipping/types/index.ts` |
| `ExportFormat` (TS) | pdf \| excel \| csv \| json \| print |  | `src/hooks/use-export.ts` |
| `BulkActionType` (TS) | delete \| update \| duplicate \| export \| restore \| archive |  | `src/hooks/useBulkActions.ts` |
| `BadgeRarity` (TS) | comum \| raro \| epico \| lendario |  | `src/hooks/useConquistas.ts` |
| `BadgeCategory` (TS) | produtividade \| qualidade \| consistencia \| especial \| sazonal |  | `src/hooks/useConquistas.ts` |
| `ExportFormat` (TS) | csv \| xlsx \| pdf |  | `src/hooks/useExportData.ts` |
| `ClassificacaoFornecedor` (TS) | A \| B \| C \| D |  | `src/hooks/useFornecedores.ts` |
| `ImportStatus` (TS) | idle \| parsing \| validating \| importing \| complete \| error |  | `src/hooks/useImportData.ts` |
| `TipoNotificacao` (TS) | estoque_baixo \| triagem_pendente \| recebimento \| recebimento_chegou \| recebimento_divergencia \| recebimento_conferido \| alerta \| info \| success \| warning |  | `src/hooks/useNotificacoes.ts` |
| `Permission` (TS) | read:products \| write:products \| delete:products \| read:inventory \| write:inventory \| read:users \| write:users \| approve:movements \| admin:all |  | `src/hooks/usePermission.ts` |
| `PeriodoRanking` (TS) | semanal \| mensal \| geral |  | `src/hooks/useRanking.ts` |
| `SortDirection` (TS) | asc \| desc |  | `src/hooks/useTable.ts` |
| `TipoRegistro` (TS) | troca \| devolucao |  | `src/hooks/useTrocasDevolucoes.ts` |
| `StatusRegistro` (TS) | aberto \| em_analise \| aprovado \| recusado \| em_transito \| recebido \| finalizado |  | `src/hooks/useTrocasDevolucoes.ts` |
| `MotivoTD` (TS) | defeito \| cor_errada \| tamanho_errado \| quantidade_errada \| produto_errado \| avaria_transporte \| desistencia \| outro |  | `src/hooks/useTrocasDevolucoes.ts` |
| `StatusCiclo` (TS) | agendado \| em_andamento \| concluido \| cancelado |  | `src/hooks/useInventarioCiclico/types.ts` |
| `TipoCiclo` (TS) | completo \| amostragem \| curva_a \| curva_b \| curva_c \| posicao \| zona |  | `src/hooks/useInventarioCiclico/types.ts` |
| `StatusContagem` (TS) | pendente \| em_andamento \| concluido \| divergencia |  | `src/hooks/useInventarioCiclico/types.ts` |
| `StatusVariant` (TS) | success \| danger \| warning \| info \| default |  | `src/lib/statusColors.ts` |
| `TransitionName` (TS) | fade \| slide-left \| slide-right \| slide-up \| slide-down \| zoom-in \| zoom-out \| flip-x \| flip-y \| parallax \| none |  | `src/lib/transitions/types.ts` |
| `AuditAction` (TS) | create \| update \| delete \| view \| login \| logout \| export \| import \| approve \| reject \| transfer \| adjust \| bulk_create \| error |  | `src/services/auditService.ts` |
| `AppRole` (TS) | operador \| supervisor \| admin |  | `src/services/authService.ts` |
| `HttpMethod` (TS) | GET \| POST \| PUT \| PATCH \| DELETE |  | `src/types/api.ts` |
| `TipoPosicao` (TS) | picking \| pulmao \| blocado \| reserva |  | `src/types/armazenamento.ts` |
| `StatusPosicao` (TS) | disponivel \| ocupado \| bloqueado \| manutencao |  | `src/types/armazenamento.ts` |
| `ZonaArmazem` (TS) | A \| B \| C \| D \| E \| F |  | `src/types/armazenamento.ts` |
| `StatusPosicao` (TS) | livre \| ocupado \| reservado \| bloqueado |  | `src/types/estoque.ts` |
| `StatusRecebimento` (TS) | aguardando \| chegou \| conferencia \| divergencia \| ok \| finalizado |  | `src/types/estoque.ts` |
| `StatusTriagem` (TS) | aguardando \| em_triagem \| aprovado \| ressalva \| reprovado \| conserto \| descarte |  | `src/types/estoque.ts` |
| `StatusItem` (TS) | aguardando \| recebido \| triagem \| aprovado \| armazenado \| separado |  | `src/types/estoque.ts` |
| `TipoMovimentacao` (TS) | recebimento \| armazenamento \| transferencia \| saida_gravacao \| retorno_gravacao \| expedicao \| ajuste |  | `src/types/estoque.ts` |
| `TipoEmbalagem` (TS) | original \| plastica \| generica |  | `src/types/estoque.ts` |
| `TipoDefeito` (TS) | arranhao \| mancha \| costura \| componente_faltando \| cor_diferente \| tamanho_errado \| deformacao \| quebra \| outro |  | `src/types/estoque.ts` |
| `ClassificacaoFornecedor` (TS) | A \| B \| C \| N |  | `src/types/fornecedor.ts` |
| `BadgeRarity` (TS) | comum \| raro \| epico \| lendario |  | `src/types/gamificacao.ts` |
| `BadgeCategory` (TS) | produtividade \| qualidade \| consistencia \| especial \| sazonal |  | `src/types/gamificacao.ts` |
| `PeriodoRanking` (TS) | semanal \| mensal \| geral |  | `src/types/gamificacao.ts` |
| `StatusDesafio` (TS) | ativo \| concluido \| expirado \| cancelado |  | `src/types/gamificacao.ts` |
| `TipoEventoXP` (TS) | triagem_concluida \| triagem_rapida \| triagem_perfeita \| desafio_concluido \| conquista_desbloqueado \| streak_mantido \| bonus_diario |  | `src/types/gamificacao.ts` |
| `SortDirection` (TS) | asc \| desc |  | `src/types/index.ts` |
| `StatusCiclo` (TS) | planejado \| em_andamento \| concluido \| cancelado |  | `src/types/inventario.ts` |
| `TipoCiclo` (TS) | curva_a \| curva_b \| curva_c \| geral \| amostragem |  | `src/types/inventario.ts` |
| `StatusContagem` (TS) | pendente \| em_contagem \| conferido \| divergente \| ajustado |  | `src/types/inventario.ts` |
| `TipoKPI` (TS) | triagem \| picking \| armazenamento \| recebimento \| expedicao \| qualidade \| produtividade |  | `src/types/kpis.ts` |
| `TipoMeta` (TS) | maior_melhor \| menor_melhor |  | `src/types/kpis.ts` |
| `StatusAlerta` (TS) | ativo \| reconhecido \| resolvido \| ignorado |  | `src/types/kpis.ts` |
| `SeveridadeAlerta` (TS) | info \| warning \| critical |  | `src/types/kpis.ts` |
| `PeriodoAnalise` (TS) | hoje \| semana \| mes \| trimestre \| ano |  | `src/types/kpis.ts` |
| `PosicaoTipo` (TS) | picking \| pulmao \| blocado \| chao |  | `src/types/posicao.ts` |
| `PosicaoStatus` (TS) | livre \| ocupado \| reservado \| bloqueado |  | `src/types/posicao.ts` |
| `StatusRecebimento` (TS) | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado |  | `src/types/recebimento.ts` |
| `TipoRelatorio` (TS) | estoque \| movimentacoes \| recebimentos \| triagens \| produtividade \| divergencias \| fornecedores \| trocas \| inventario \| kpis |  | `src/types/relatorios.ts` |
| `FormatoExportacao` (TS) | pdf \| xlsx \| csv |  | `src/types/relatorios.ts` |
| `PeriodoRelatorio` (TS) | hoje \| semana \| mes \| trimestre \| ano \| personalizado |  | `src/types/relatorios.ts` |
| `StatusTriagem` (TS) | pendente \| em_andamento \| pausado \| concluido \| cancelado |  | `src/types/triagem.ts` |
| `ResultadoTriagem` (TS) | aprovado \| aprovado_parcial \| reprovado \| pendente |  | `src/types/triagem.ts` |
| `TipoDefeito` (TS) | risco \| mancha \| amassado \| quebrado \| faltando_pecas \| cor_diferente \| tamanho_incorreto \| outro |  | `src/types/triagem.ts` |
| `SeveridadeDefeito` (TS) | leve \| moderado \| grave \| critico |  | `src/types/triagem.ts` |
| `TipoFotoTriagem` (TS) | geral \| etiqueta \| detalhe \| defeito |  | `src/types/triagem.ts` |
| `TipoRegistro` (TS) | troca \| devolucao |  | `src/types/trocas.ts` |
| `StatusRegistro` (TS) | pendente \| em_analise \| autorizado \| em_transito \| recebido \| finalizado \| cancelado |  | `src/types/trocas.ts` |
| `UIStatus` (TS) | pendente \| em_analise \| autorizado \| enviado \| concluido \| cancelado |  | `src/types/trocas.ts` |
| `MotivoTD` (TS) | defeito \| tamanho_errado \| cor_errada \| produto_errado \| arrependimento \| avaria_transporte \| outro |  | `src/types/trocas.ts` |
| `UsuarioRole` (TS) | admin \| supervisor \| operador \| visualizador |  | `src/types/usuario.ts` |
| `AgvProtocol` (TS) | vda5050 \| rest \| mqtt \| custom |  | `supabase/functions/_shared/agv.ts` |
| `ForecastModel` (TS) | naive \| sma \| ses \| holt \| holt_winters_additive |  | `supabase/functions/_shared/forecast.ts` |
| `LogLevel` (TS) | debug \| info \| warn \| error |  | `supabase/functions/_shared/logger.ts` |
| `MetricType` (TS) | counter \| gauge \| histogram \| summary |  | `supabase/functions/_shared/prometheus.ts` |

## Dados de referência (seed — planos, categorias, perfis fixos)

| Tabela | Colunas | Valores | Origem |
|---|---|---|---|
| `categories` | `id, name, code, description, parent_id, is_active` | `(gen_random_uuid(), 'Brindes Promocionais', 'BRINDES', 'Produtos para brindes corporativos', NULL, true), (gen_random_uuid(), 'Eletrônicos', 'ELETRO', 'Dispositivos eletrônicos', NULL, true), (gen_random_uuid(), 'Escritório', 'ESCRIT', 'Material de escritório', NULL, true), (gen_random_uuid(), 'Têxteis', 'TEXTIL', 'Camisetas, bonés, bolsas', NULL, true), (gen_random_uuid(), 'Embalagens', 'EMBAL', …` | `supabase/seed.sql` |
| `locations` | `id, code, name, zone, aisle, rack, level, position, type, capacity, is_active` | `(gen_random_uuid(), 'REC-01', 'Recebimento 01', 'RECEBIMENTO', 'A', '01', '01', '01', 'receiving', 1000, true), (gen_random_uuid(), 'REC-02', 'Recebimento 02', 'RECEBIMENTO', 'A', '01', '01', '02', 'receiving', 1000, true), (gen_random_uuid(), 'ARM-A-01-01', 'Estante A-01-01', 'ARMAZENAGEM', 'A', '01', '01', '01', 'storage', 100, true), (gen_random_uuid(), 'ARM-A-01-02', 'Estante A-01-02', 'ARMAZE …` | `supabase/seed.sql` |
| `units_of_measure` | `id, code, name, symbol, base_unit, conversion_factor` | `(gen_random_uuid(), 'UN', 'Unidade', 'un', 'UN', 1), (gen_random_uuid(), 'CX', 'Caixa', 'cx', 'UN', 12), (gen_random_uuid(), 'PC', 'Pacote', 'pct', 'UN', 10), (gen_random_uuid(), 'KG', 'Quilograma', 'kg', 'KG', 1), (gen_random_uuid(), 'MT', 'Metro', 'm', 'MT', 1), (gen_random_uuid(), 'LT', 'Litro', 'L', 'LT', 1) ON CONFLICT (code) DO NOTHING` | `supabase/seed.sql` |
| `order_statuses` | `id, code, name, description, color, sequence, is_final` | `(gen_random_uuid(), 'PENDING', 'Pendente', 'Aguardando processamento', '#f59e0b', 1, false), (gen_random_uuid(), 'PROCESSING', 'Em Processamento', 'Sendo processado', '#3b82f6', 2, false), (gen_random_uuid(), 'PICKING', 'Em Separação', 'Itens sendo separados', '#8b5cf6', 3, false), (gen_random_uuid(), 'PACKED', 'Embalado', 'Pronto para expedição', '#06b6d4', 4, false), (gen_random_uuid(), 'SHIPPED …` | `supabase/seed.sql` |
| `carriers` | `id, code, name, cnpj, phone, email, tracking_url, is_active` | `(gen_random_uuid(), 'CORREIOS', 'Correios', '34028316000103', '0800-725-7282', 'faleconosco@correios.com.br', 'https://rastreamento.correios.com.br/app/index.php?objetos={tracking}', true), (gen_random_uuid(), 'JADLOG', 'Jadlog', '04884082000135', '0800-725-3569', 'contato@jadlog.com.br', 'https://www.jadlog.com.br/tracking?code={tracking}', true), (gen_random_uuid(), 'LALAMOVE', 'Lalamove', '2743 …` | `supabase/seed.sql` |
| `suppliers` | `id, code, name, cnpj, phone, email, address, city, state, is_active` | `(gen_random_uuid(), 'XBZ', 'XBZ Brindes', '12345678000199', '11-99999-9999', 'contato@xbz.com.br', 'Rua dos Brindes, 100', 'São Paulo', 'SP', true), (gen_random_uuid(), 'ASIA', 'Asia Import', '98765432000188', '11-88888-8888', 'vendas@asiaimport.com.br', 'Av. Importadora, 500', 'São Paulo', 'SP', true), (gen_random_uuid(), 'SOMARCAS', 'Só Marcas', '11111111000111', '11-77777-7777', 'comercial@soma …` | `supabase/seed.sql` |
| `system_settings` | `key, value, description, type` | `('company_name', '"Promo Brindes"', 'Nome da empresa', 'string'), ('company_cnpj', '"12345678000190"', 'CNPJ da empresa', 'string'), ('default_warehouse', '"MATRIZ"', 'Armazém padrão', 'string'), ('stock_alert_threshold', '10', 'Limite para alerta de estoque baixo', 'number'), ('auto_generate_lots', 'true', 'Gerar lotes automaticamente no recebimento', 'boolean'), ('require_lot_on_pick', 'true', ' …` | `supabase/seed.sql` |
| `activity_logs` | `action, entity_type, entity_id, changes, created_by` | `( 'SEED_DATABASE', 'system', 'seed_script', '{"version": "1.0", "executed_at": "' \|\| NOW() \|\| '"}', '00000000-0000-0000-0000-000000000001' )` | `supabase/seed.sql` |

## Auditoria de consistência (código × schema) — trate como NÃO VERIFICADO

> `status`: inclui estados só de UI/realtime (ex.: `uploading`, `SUBSCRIBED`) que nunca vão ao banco — confira o arquivo antes de concluir que falta valor no enum.

| Tipo | Problema | Onde |
|---|---|---|
| status | valor `Platinum` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/charts/TriagemCharts.tsx`<br>`escreve:src/components/charts/TriagemCharts.tsx` |
| status | valor `Gold` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/charts/TriagemCharts.tsx` |
| status | valor `Audit` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/charts/TriagemCharts.tsx` |
| status | valor `SUBSCRIBED` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/common/PresenceAvatars.tsx`<br>`compara:src/features/analytics/pages/RealtimeDashboardPage.tsx`<br>`compara:src/hooks/usePresence.ts`<br>`compara:src/hooks/useRealtime.ts` |
| status | valor `optimal` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/dashboard/SystemHealthHUD.tsx` |
| status | valor `degraded` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/dashboard/SystemHealthHUD.tsx` |
| status | valor `current` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/data/Timeline.tsx`<br>`compara:src/features/shipping/components/ExpedicaoTimeline.tsx`<br>`compara:src/pages/Rastreabilidade.tsx`<br>`escreve:src/features/shipping/components/ExpedicaoTimeline.tsx` |
| status | valor `loading` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/display/OptimizedImage.tsx` |
| status | valor `loaded` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/display/OptimizedImage.tsx` |
| status | valor `investigacao` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/governanca/OcorrenciasTab.tsx`<br>`compara:src/hooks/useGovernanca.ts`<br>`escreve:src/components/governanca/OcorrenciasTab.tsx` |
| status | valor `encerrado` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/useGovernanca.ts`<br>`escreve:src/components/governanca/OcorrenciasTab.tsx` |
| status | valor `incomplete` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/security/SecurityOverview.tsx` |
| status | valor `empty` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/wms/BinGrid.tsx` |
| status | valor `available` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/wms/LocationPicker.tsx`<br>`compara:src/hooks/useSerialTracking.ts`<br>`escreve:src/components/wms/LocationPicker.tsx`<br>`escreve:src/hooks/useSerialTracking.ts` |
| status | valor `occupied` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/wms/LocationPicker.tsx`<br>`compara:src/services/locationService.ts` |
| status | valor `created` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/wms/ShipmentTracker.tsx`<br>`escreve:supabase/functions/create-shipment/index.ts`<br>`escreve:supabase/functions/shipping-manifest/index.ts` |
| status | valor `crítico` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/features/inventory/components/MapaCalorOcupacao.tsx` |
| status | valor `ideal` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/features/inventory/components/MapaCalorOcupacao.tsx` |
| status | valor `limite` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/features/quality/components/AmostragemProgresso.tsx` |
| status | valor `imported` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/features/receiving/components/ImportarNFDialog.tsx`<br>`escreve:src/types/integrations.ts`<br>`escreve:supabase/functions/nfe-import/index.ts` |
| status | valor `alert` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/features/shipping/components/ExpedicaoTimeline.tsx` |
| status | valor `in_transit` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/useCarrierIntegration.ts`<br>`escreve:supabase/functions/carrier-track/index.ts` |
| status | valor `desconhecido` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/useScanner.ts` |
| status | valor `healthy` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/lib/healthcheck.ts`<br>`escreve:supabase/functions/health-check/index.ts`<br>`escreve:supabase/functions/health/index.ts` |
| status | valor `online` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/Hub.tsx`<br>`escreve:src/pages/Hub.tsx` |
| status | valor `syncing` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/Hub.tsx`<br>`escreve:src/pages/Hub.tsx` |
| status | valor `postado` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/IntegracaoTransportadoras.tsx`<br>`escreve:src/pages/IntegracaoTransportadoras.tsx` |
| status | valor `transito` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/IntegracaoTransportadoras.tsx`<br>`escreve:src/pages/IntegracaoTransportadoras.tsx` |
| status | valor `planned` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/types/wms.ts`<br>`escreve:supabase/functions/wave-planning/index.ts` |
| status | valor `ocupada` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/calculate-kpis/index.ts`<br>`compara:supabase/functions/generate-report/index.ts` |
| status | valor `shipped` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/cancel-order/index.ts`<br>`compara:supabase/functions/reports/index.ts`<br>`escreve:supabase/functions/create-shipment/index.ts`<br>`escreve:supabase/functions/shipping-label/index.ts` |
| status | valor `delivered` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/cancel-order/index.ts`<br>`compara:supabase/functions/reports/index.ts`<br>`escreve:supabase/functions/carrier-track/index.ts` |
| status | valor `generated` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/carrier-label/index.ts` |
| status | valor `posted` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/carrier-track/index.ts` |
| status | valor `out_for_delivery` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/carrier-track/index.ts` |
| status | valor `draft` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/create-purchase-order/index.ts` |
| status | valor `processed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/edi-process/index.ts` |
| status | valor `pass` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/health-check/index.ts` |
| status | valor `fail` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/health-check/index.ts` |
| status | valor `packing` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/packing-start/index.ts` |
| status | valor `assigned` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/picking-assign/index.ts` |
| status | valor `ready_for_packing` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/picking-confirm/index.ts` |
| status | valor `received` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/receiving-confirm/index.ts`<br>`escreve:supabase/functions/receiving-confirm/index.ts` |
| status | valor `putaway` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receiving-putaway/index.ts` |
| status | valor `putaway_completed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receiving-putaway/index.ts` |
| status | valor `label_generated` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/shipping-label/index.ts` |
| status | valor `manifested` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/shipping-manifest/index.ts` |
| status | valor `otimizada` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/wave-optimize/index.ts` |
| status | valor `wave_assigned` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/wave-planning/index.ts` |
| status | valor `verify` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/MFAEnroll.tsx` |
| status | valor `start` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/MFAEnroll.tsx` |
| status | valor `scan` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/MFAEnroll.tsx` |
| status | valor `blocked` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/common/LeaveGuard.tsx`<br>`compara:src/hooks/useNavigationGuard.ts` |
| status | valor `installed` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/pwa/UpdatePrompt.tsx`<br>`compara:src/lib/register-sw.ts` |
| status | valor `expanded` para `state` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/ui/sidebar.tsx` |
| status | valor `collapsed` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/ui/sidebar.tsx` |
| status | valor `suspended` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/features/analytics/hooks/useKPIAlerts.ts` |
| status | valor `HALF_OPEN` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/lib/circuit-breaker.ts`<br>`escreve:src/lib/circuit-breaker.ts` |
| status | valor `CLOSED` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/lib/circuit-breaker.ts`<br>`compara:src/pages/admin/CircuitBreakersPage.tsx`<br>`escreve:src/lib/circuit-breaker.ts`<br>`escreve:src/pages/admin/CircuitBreakersPage.tsx` |
| status | valor `OPEN` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/lib/circuit-breaker.ts`<br>`compara:src/pages/admin/CircuitBreakersPage.tsx` |
| status | valor `SP` para `state` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/shipping-label/index.ts` |
| coluna | coluna `weekly_digest` usada no código não existe no schema de `profiles` |  |
| coluna | coluna `count` usada no código não existe no schema de `posicoes_estoque` |  |
| coluna | coluna `codigo` usada no código não existe no schema de `lotes` |  |
| coluna | coluna `active` usada no código não existe no schema de `products` |  |
| coluna | coluna `category` usada no código não existe no schema de `products` |  |
| coluna | coluna `cost` usada no código não existe no schema de `products` |  |
| coluna | coluna `current_stock` usada no código não existe no schema de `products` |  |
| coluna | coluna `lead_time_days` usada no código não existe no schema de `products` |  |
| coluna | coluna `min_stock` usada no código não existe no schema de `products` |  |
| coluna | coluna `ml_item_id` usada no código não existe no schema de `products` |  |
| coluna | coluna `price` usada no código não existe no schema de `products` |  |
| coluna | coluna `reorder_point` usada no código não existe no schema de `products` |  |
| coluna | coluna `reorder_quantity` usada no código não existe no schema de `products` |  |
| coluna | coluna `reserved_quantity` usada no código não existe no schema de `products` |  |
| coluna | coluna `totvs_product_id` usada no código não existe no schema de `products` |  |
| coluna | coluna `pedidos_ids` usada no código não existe no schema de `ondas_separacao` |  |
| coluna | coluna `wave_id` usada no código não existe no schema de `orders` |  |
| coluna | coluna `permissions` usada no código não existe no schema de `user_roles` |  |
| coluna | coluna `product_id` usada no código não existe no schema de `order_items` |  |
| coluna | coluna `quantity` usada no código não existe no schema de `order_items` |  |
| coluna | coluna `capacity` usada no código não existe no schema de `locations` |  |
| coluna | coluna `code` usada no código não existe no schema de `locations` |  |
| coluna | coluna `is_active` usada no código não existe no schema de `locations` |  |
| coluna | coluna `name` usada no código não existe no schema de `locations` |  |
| coluna | coluna `type` usada no código não existe no schema de `locations` |  |
| tabela | tabela `a` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `activity_logs` usada no código não existe nas migrations/types do repo | `supabase/functions/cron-weekly/index.ts` |
| tabela | tabela `ai_logs` usada no código não existe nas migrations/types do repo | `supabase/functions/ai-classification/index.ts` |
| tabela | tabela `ajustes_inventario` usada no código não existe nas migrations/types do repo | `supabase/functions/adjust-inventory/index.ts` |
| tabela | tabela `alerts` usada no código não existe nas migrations/types do repo | `supabase/functions/alert-expiration/index.ts`<br>`supabase/functions/alert-pending-orders/index.ts`<br>`supabase/functions/alert-stock-low/index.ts` |
| tabela | tabela `backups` usada no código não existe nas migrations/types do repo | `src/services/backupService.ts`<br>`supabase/functions/backup-database/index.ts` |
| tabela | tabela `boletos` usada no código não existe nas migrations/types do repo | `supabase/functions/boleto-generate/index.ts` |
| tabela | tabela `cache_entries` usada no código não existe nas migrations/types do repo | `supabase/functions/cleanup-sessions/index.ts` |
| tabela | tabela `categories` usada no código não existe nas migrations/types do repo | `supabase/functions/batch-import/index.ts` |
| tabela | tabela `contacts` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `cron_logs` usada no código não existe nas migrations/types do repo | `supabase/functions/cleanup-sessions/index.ts`<br>`supabase/functions/cron-daily/index.ts`<br>`supabase/functions/cron-weekly/index.ts` |
| tabela | tabela `dashboard_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `edi_documents` usada no código não existe nas migrations/types do repo | `supabase/functions/edi-process/index.ts` |
| tabela | tabela `emails` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `fantasma` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `files` usada no código não existe nas migrations/types do repo | `supabase/functions/upload-file/index.ts` |
| tabela | tabela `fixture_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `ghost_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `images` usada no código não existe nas migrations/types do repo | `supabase/functions/upload-image/index.ts` |
| tabela | tabela `integration_logs` usada no código não existe nas migrations/types do repo | `supabase/functions/integration-amazon/index.ts`<br>`supabase/functions/integration-ifood/index.ts`<br>`supabase/functions/integration-mercado-livre/index.ts`<br>`supabase/functions/integration-rappi/index.ts` |
| tabela | tabela `inventory_reservations` usada no código não existe nas migrations/types do repo | `supabase/functions/inventory-reserve/index.ts` |
| tabela | tabela `invoices` usada no código não existe nas migrations/types do repo | `supabase/functions/invoice-generate/index.ts` |
| tabela | tabela `location_stock` usada no código não existe nas migrations/types do repo | `supabase/functions/alert-expiration/index.ts`<br>`supabase/functions/generate-pick-list/index.ts`<br>`supabase/functions/receiving-putaway/index.ts`<br>`supabase/functions/transfer-stock/index.ts` |
| tabela | tabela `lot_tracking` usada no código não existe nas migrations/types do repo | `supabase/functions/reports/index.ts` |
| tabela | tabela `lots` usada no código não existe nas migrations/types do repo | `supabase/functions/check-expiration/index.ts`<br>`supabase/functions/create-lot/index.ts` |
| tabela | tabela `merged_documents` usada no código não existe nas migrations/types do repo | `supabase/functions/merge-pdfs/index.ts` |
| tabela | tabela `nfe` usada no código não existe nas migrations/types do repo | `supabase/functions/nfe-process/index.ts` |
| tabela | tabela `packings` usada no código não existe nas migrations/types do repo | `supabase/functions/packing-start/index.ts` |
| tabela | tabela `payments` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs`<br>`supabase/functions/payment-create/index.ts` |
| tabela | tabela `pick_list_items` usada no código não existe nas migrations/types do repo | `supabase/functions/picking-confirm/index.ts`<br>`supabase/functions/wave-release/index.ts` |
| tabela | tabela `pick_lists` usada no código não existe nas migrations/types do repo | `supabase/functions/picking-assign/index.ts`<br>`supabase/functions/picking-confirm/index.ts`<br>`supabase/functions/wave-release/index.ts` |
| tabela | tabela `picking_routes` usada no código não existe nas migrations/types do repo | `supabase/functions/picking-optimize/index.ts` |
| tabela | tabela `picking_waves` usada no código não existe nas migrations/types do repo | `supabase/functions/wave-planning/index.ts`<br>`supabase/functions/wave-release/index.ts` |
| tabela | tabela `pix_payments` usada no código não existe nas migrations/types do repo | `supabase/functions/pix-generate/index.ts` |
| tabela | tabela `receiving_documents` usada no código não existe nas migrations/types do repo | `supabase/functions/batch-import/index.ts`<br>`supabase/functions/reports/index.ts` |
| tabela | tabela `reorder_suggestions` usada no código não existe nas migrations/types do repo | `supabase/functions/reorder-check/index.ts` |
| tabela | tabela `runtime_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `sales_orders` usada no código não existe nas migrations/types do repo | `supabase/functions/cancel-order/index.ts`<br>`supabase/functions/create-sales-order/index.ts` |
| tabela | tabela `sessions` usada no código não existe nas migrations/types do repo | `supabase/functions/cron-daily/index.ts` |
| tabela | tabela `shipments` usada no código não existe nas migrations/types do repo | `supabase/functions/carrier-track/index.ts`<br>`supabase/functions/create-shipment/index.ts`<br>`supabase/functions/label-print/index.ts`<br>`supabase/functions/reports/index.ts` |
| tabela | tabela `shipping_labels` usada no código não existe nas migrations/types do repo | `supabase/functions/carrier-label/index.ts` |
| tabela | tabela `shipping_manifests` usada no código não existe nas migrations/types do repo | `supabase/functions/shipping-manifest/index.ts` |
| tabela | tabela `so_teste` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `stock_alerts` usada no código não existe nas migrations/types do repo | `supabase/functions/stock-alert/index.ts` |
| tabela | tabela `stock_balances` usada no código não existe nas migrations/types do repo | `supabase/functions/reports/index.ts`<br>`supabase/functions/stock-movement/index.ts` |
| tabela | tabela `stock_transfers` usada no código não existe nas migrations/types do repo | `supabase/functions/transfer-stock/index.ts` |
| tabela | tabela `suppliers` usada no código não existe nas migrations/types do repo | `supabase/functions/batch-import/index.ts` |
| tabela | tabela `t` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `t1` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `tabela` usada no código não existe nas migrations/types do repo | `scripts/inventario/gerar-banco.mjs`<br>`scripts/inventario/gerar-repo.mjs` |
| tabela | tabela `temp_files` usada no código não existe nas migrations/types do repo | `supabase/functions/cleanup-sessions/index.ts` |
| tabela | tabela `temp_tokens` usada no código não existe nas migrations/types do repo | `supabase/functions/cleanup-sessions/index.ts` |
| tabela | tabela `tools_runtime` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `tx` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `units_of_measure` usada no código não existe nas migrations/types do repo | `supabase/functions/batch-import/index.ts` |
| tabela | tabela `user_sessions` usada no código não existe nas migrations/types do repo | `supabase/functions/cleanup-sessions/index.ts` |
| tabela | tabela `users` usada no código não existe nas migrations/types do repo | `supabase/functions/picking-assign/index.ts` |
| rls | `conquistas_usuarios`: front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| rls | `desafios_usuarios`: front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| rls | `gamificacao_usuarios`: front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/components/gamificacao/GamificacaoLoja.tsx` |
| rls | `gamificacao_usuarios`: front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| rls | `order_items`: front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/orderService.ts` |
| rls | `produtos`: front faz DELETE mas nenhuma política RLS permite DELETE → vai falhar/retornar vazio para usuários | `src/services/productService.ts` |
| rls | `user_devices`: acessada do front (2 arquivo(s)) sem RLS (não encontrado) | `src/components/security/DeviceManagement.tsx`<br>`src/components/security/SecurityOverview.tsx` |
| edge | edge function `dashboard-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `fixture-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `ghost-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `inexistente` invocada mas não existe em supabase/functions/ | `scripts/ai-context/cenarios.mjs` |
| edge | edge function `orphan-fn` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `other` invocada mas não existe em supabase/functions/ | `scripts/ai-context/cenarios.mjs` |
| edge | edge function `runtime-fn` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `runtime-missing` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `tools-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `dashboard_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `decrease_location_stock` chamada mas não definida nas migrations/types | `supabase/functions/picking-confirm/index.ts` |
| rpc | RPC `demo` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/test_snapshot.py` |
| rpc | RPC `fixture_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `fn` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/snapshot.py` |
| rpc | RPC `get_inventory_summary` chamada mas não definida nas migrations/types | `supabase/functions/reports/index.ts` |
| rpc | RPC `get_min_stock_threshold` chamada mas não definida nas migrations/types | `supabase/functions/stock-alert/index.ts` |
| rpc | RPC `get_reorder_point` chamada mas não definida nas migrations/types | `supabase/functions/check-reorder/index.ts` |
| rpc | RPC `ghost_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `is_admin` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `nome` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/snapshot.py` |
| rpc | RPC `r1` chamada mas não definida nas migrations/types | `scripts/ai-context/cenarios.mjs` |
| rpc | RPC `recalculate_weekly_stats` chamada mas não definida nas migrations/types | `supabase/functions/cron-weekly/index.ts` |
| rpc | RPC `runtime_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `tools_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `x` chamada mas não definida nas migrations/types | `scripts/inventario/gerar-rotas.mjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/probe-all.cjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/probe-cols.cjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/probe-empty.cjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/probe-full.cjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/probe-full2.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-app-tables.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-aprovacoes.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-cadastros.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-conferencia.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-expedicao.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-kpis.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-others-v3.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-others.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-putaway.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-qualidade.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/seed-trocas.cjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/inventario/gerar-banco.mjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/regras_negocio/generate.py` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `src/components/ImportExport/ExportSection.tsx` |
| dinâmico | 6 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `src/hooks/useDuplicate.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/backup-database/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/bulk-delete/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/bulk-insert/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/bulk-update/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/bulk-upsert/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/export-data/index.ts` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/import-data/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/upload-multiple/index.ts` |
| segurança | função `audit_trigger_func` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20240116_audit_logs.sql` |
| segurança | função `release_expired_reservations` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20240118_stock_reservations.sql` |
| segurança | função `create_entity_version` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20251231000002_create_entity_versions_table.sql` |
| segurança | função `restore_entity_version` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20251231000002_create_entity_versions_table.sql` |
| segurança | função `get_entity_history` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20251231000002_create_entity_versions_table.sql` |
| segurança | função `incrementar_metrica_dashboard` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512154028_f6e87c7d-35b1-41d9-9cee-b45e216c3279.sql` |
| segurança | função `descontar_pontos` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512175225_da3abfa7-9242-450f-b0e6-007c4d9ee375.sql` |
| segurança | função `log_posicao_status_change` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512193751_e5fcb1fd-f193-4ba6-a6d6-781e544b9a92.sql` |

## Lacunas — o que este contexto NÃO consegue responder (perguntas para o dono do negócio)

- Nenhuma regra manual em `manual/`: prazos, limites, exceções comerciais, quem aprova o quê — só o negócio sabe.
- `triagens.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `nfe_documents.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `custodia_transferencias.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `ocorrencias_perda.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `aprovacoes_movimentacao.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `ajustes_estoque.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `posicao_status_log.status_anterior` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `posicao_status_log.status_novo` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `setores_checkpoint.status_integridade` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `recuperacao_materiais.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `armazens.estado` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `clientes.estado` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `products.quality_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `locations.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `purchase_orders.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `receivings.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `receiving_items.quality_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `receiving_items.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `inventory_lots.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `pick_orders.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `putaway_orders.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- 95/98 tabelas sem `COMMENT ON TABLE` — o significado de negócio não está no schema: `notifications`, `inventory_counts`, `inventory_count_items`, `stock_reservations`, `import_logs`, `profiles`, `user_roles`, `posicoes_estoque`, `produtos`, `lotes`, `estoque_posicao`, `inventario_ciclos` …
- Há tabelas usadas no código sem migration no repo — o schema real pode ter sido alterado pelo painel.

## Regras manuais presentes

_nenhuma — copie `manual/TEMPLATE-regras-de-negocio.md`_
