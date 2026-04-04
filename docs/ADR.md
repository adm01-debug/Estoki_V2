# 📐 Architecture Decision Records (ADRs)

## ADR-001: React + Supabase como stack principal

**Status**: Aceito  
**Data**: 2024-12  
**Contexto**: Necessidade de um WMS moderno com tempo de desenvolvimento rápido.  
**Decisão**: React 18 + TypeScript no frontend, Supabase (Postgres + Auth + Edge Functions + Realtime) no backend.  
**Consequências**: ✅ Desenvolvimento rápido, RLS nativo, realtime grátis. ⚠️ Vendor lock-in parcial no Supabase.

---

## ADR-002: Feature-based folder structure

**Status**: Aceito  
**Data**: 2024-12  
**Contexto**: Codebase crescendo com 100+ componentes, risco de "big ball of mud".  
**Decisão**: Organização por feature/domínio em `src/pages/`, hooks por domínio, componentes compartilhados em `src/components/ui/`.  
**Consequências**: ✅ Fácil encontrar código, boa escalabilidade. ⚠️ Alguns componentes cruzam domínios.

---

## ADR-003: TanStack Query como data layer

**Status**: Aceito  
**Data**: 2024-12  
**Contexto**: Necessidade de cache inteligente, invalidação automática e suporte offline.  
**Decisão**: TanStack Query v5 para todas as operações de dados (CRUD + cache).  
**Consequências**: ✅ Cache automático, deduplicação, optimistic updates. ⚠️ Curva de aprendizado para devs juniores.

---

## ADR-004: Zustand + Jotai para estado global

**Status**: Aceito  
**Data**: 2025-01  
**Contexto**: Estado de UI (sidebar, tema, filtros) precisa ser global sem prop drilling.  
**Decisão**: Zustand para stores complexas (auth, navigation), Jotai para átomos simples.  
**Consequências**: ✅ Leve, sem boilerplate. ⚠️ Dois libs de estado pode confundir.

---

## ADR-005: RLS como camada primária de autorização

**Status**: Aceito  
**Data**: 2025-01  
**Contexto**: Segurança deve ser enforced no banco, não apenas no frontend.  
**Decisão**: Row Level Security em 100% das tabelas, com função `has_role()` SECURITY DEFINER.  
**Consequências**: ✅ Segurança robusta, impossível bypass via API. ⚠️ Complexidade em policies multi-role.

---

## ADR-006: Circuit Breaker para integrações externas

**Status**: Aceito  
**Data**: 2025-04  
**Contexto**: Integrações com Correios, Bitrix24, SEFAZ podem ficar offline e degradar o sistema.  
**Decisão**: Circuit Breaker pattern em `src/lib/circuit-breaker.ts` com instâncias por serviço.  
**Consequências**: ✅ Graceful degradation, fast-fail. ⚠️ Requer monitoramento do estado dos circuitos.

---

## ADR-007: State Machines para transições de status

**Status**: Aceito  
**Data**: 2025-04  
**Contexto**: Transições de status de lotes/tarefas/ondas eram ad-hoc, permitindo estados inválidos.  
**Decisão**: State machines explícitas em `src/lib/state-machines.ts` com validação type-safe.  
**Consequências**: ✅ Impossível transição inválida, documentação viva. ⚠️ Precisa manter sync com DB enums.

---

## ADR-008: DOMPurify para sanitização de HTML

**Status**: Aceito  
**Data**: 2025-04  
**Contexto**: Editor Markdown usa `dangerouslySetInnerHTML`, risco de XSS.  
**Decisão**: DOMPurify com whitelist explícita de tags/atributos em todo HTML dinâmico.  
**Consequências**: ✅ XSS mitigado. ⚠️ Dependência adicional (~15KB).

---

## ADR-009: Optimistic Locking via version column

**Status**: Aceito  
**Data**: 2025-04  
**Contexto**: Operações simultâneas em lotes/estoque podiam causar lost updates.  
**Decisão**: Coluna `version` com auto-increment em 6 tabelas críticas.  
**Consequências**: ✅ Conflitos de concorrência detectados. ⚠️ Frontend deve tratar HTTP 409 (conflict).

---

## ADR-010: Structured Logging com PII masking

**Status**: Aceito  
**Data**: 2025-04  
**Contexto**: Console.logs em produção sem estrutura, risco de vazar PII (LGPD).  
**Decisão**: Logger centralizado com JSON output, mascaramento automático de campos sensíveis.  
**Consequências**: ✅ LGPD-safe, logs pesquisáveis. ⚠️ Overhead mínimo de serialização.
