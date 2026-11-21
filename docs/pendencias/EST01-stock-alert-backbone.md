# EST01 — backbone minimo aditivo para alertas de estoque

- **Origem:** desdobramento do AUTO-01 (cron de alertas). As edge functions de estoque/reorder (check-reorder, reorder-check, stock-alert, alert-stock-low) foram escritas contra um schema que **nunca existiu em produção**.
- **Estado real conferido (21/11/2026):** `products` em produção tinha só 6 colunas (id, sku, name, stock_quantity, quality_status, timestamps). **Não existiam** reorder_point, current_stock, min_stock, suppliers, reorder_suggestions, stock_alerts, nem as RPCs get_reorder_point/get_min_stock_threshold. Sem isso, as funções falhariam se chamadas.
- **Camadas afetadas:** banco, RLS.
- **Regras de negócio:** thresholds de reorder/min são **dado de negócio** (não definidos no repo nem no banco). Defaults conservadores (reorder_global=10, min_global=5).
- **Raio de impacto:** check-reorder/safety-stock (deployadas) e reorder-check/stock-alert (disco) — passam a ter schema válido; nada existente é alterado.
- **Dependências:** nenhuma (base fundacional para os crons de alerta).
- **Critério de aceite:** migration aditiva aplicada, tabelas/colunas/RPCs presentes, RLS coerente.

## O que foi feito (21/11/2026)

- **products**: +10 colunas aditivas com default (supplier_id, current_stock=0, reorder_point=0, reorder_quantity=0, min_stock=0, safety_stock=0, avg_daily_sales=0, min_order_qty=1, active=true, category). Nada existente alterado.
- **Novas tabelas**: suppliers, reorder_suggestions (unique product_id), stock_alerts — com RLS + grants conservadores.
- **Novas RPCs**: get_reorder_point (default 10), get_min_stock_threshold (default 5), STABLE, grants authenticated/service_role.
- **Backfill**: current_stock=stock_quantity nos 21 produtos (baseline: 0 baixos, 0 zerados).

## Verificação real (evidência)

- **No ROLLBACK:** migration validada em transação completa (tabelas criadas e revertidas, colunas revertidas — `[]`).
- **Aplicada em produção:** reorder_suggestions/stock_alerts/suppliers existem; 5 colunas confirmadas; RPCs get_reorder_point/get_min_stock_threshold existem e respondem 10/5.
- **RPCs chamadas:** `select get_reorder_point()` → 10; `get_min_stock_threshold()` → 5.

## Estado

- **PR #138 mergeada (21/11):** migration versionada + cron aplicados. **Regra 8 (DDL produção) → aprovado pelo dono.**
- **Thresholds definidos (regra conservadora 12%/35%):** min_stock = 12% do estoque (piso 5); reorder_point = min_stock + 10. Aplicado nos 21 produtos (nenhum produto real abaixo → 0 alertas espúrios; só TEST-SKU-001, sku de teste, abaixo).
- **reorder-check deployada e testada de ponta a ponta (21/11):** sugestão para TEST-SKU-001 (stock 10 ≤ reorder 11, qty 35) persistida em reorder_suggestions (status pending). Corrigidos 2 bugs da função: `supabase.raw()` inexistente (filtro em memória) e embed de supplier exigia FK ausente (busca em mapa separado). PR #139.
- **Cron ativo:** `reorder-check-daily` @06:30 (job id 7) chama a edge function via pg_net.http_post (status 200 validado). Migration idempotente versionada.
- **Pendente:** adicionar FK products.supplier_id→suppliers (embed do PostgREST reativa); ligar alert-stock-low (depende de location_stock/alerts inexistentes).
