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

- **PR #138:** migration versionada. **Regra 8 (DDL produção) → PR aberta para decisão do dono.**
- **Pendente de negócio:** definir reorder_point/min_stock por produto antes de ligar o cron de alerta (senão alertas espúrios — hoje todos=0, então 0 alertas, seguro).
