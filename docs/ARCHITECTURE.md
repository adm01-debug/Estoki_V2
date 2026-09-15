# Arquitetura Técnica - ESTOKI

Este documento descreve a arquitetura do sistema WMS ESTOKI: fluxo de dados ponta a ponta, organização de pastas e contratos de integração.

## 🔄 Fluxo de Dados Completo

### Visão em Camadas (UI → Hook → Supabase → RLS → Cache)

```mermaid
flowchart LR
    subgraph UI["Camada UI"]
        C[Componente React]
        S[Skeleton / Suspense]
        E[ErrorBoundary]
    end

    subgraph HOOKS["Camada de Hooks"]
        UQ[useQuery / useMutation]
        CH[Custom Hook<br/>useEstoque, useRecebimentos...]
        RT[useRealtime<br/>invalidateQueries]
    end

    subgraph CACHE["TanStack Query Cache"]
        QC[(QueryClient<br/>staleTime 5min<br/>gcTime 10min)]
    end

    subgraph SDK["Supabase Client"]
        SB[supabase-js<br/>JWT + anon key]
    end

    subgraph BACKEND["Lovable Cloud / Postgres"]
        PR[PostgREST /rest/v1]
        EF[Edge Function<br/>external-db-bridge]
        RLS{RLS Policies<br/>has_role / auth.uid}
        DB[(Tabelas + Views)]
        AUD[(audit_log<br/>query_telemetry)]
    end

    C --> CH
    CH --> UQ
    UQ -->|cache hit| QC
    UQ -->|cache miss| SB
    SB --> PR
    SB --> EF
    PR --> RLS
    EF --> RLS
    RLS -->|allow| DB
    RLS -->|deny 403| SB
    DB --> AUD
    DB --> PR
    PR --> SB
    SB --> UQ
    UQ --> QC
    QC --> CH
    CH --> C
    C -.fallback.-> S
    C -.throw.-> E
    RT -.invalida.-> QC
    DB -.postgres_changes.-> RT
```

### Sequência de uma Leitura Autenticada

```mermaid
sequenceDiagram
    autonumber
    participant UI as Componente
    participant H as Custom Hook
    participant Q as TanStack Query
    participant SB as supabase-js
    participant PG as PostgREST
    participant RLS as RLS Policy
    participant DB as Postgres

    UI->>H: mount / props change
    H->>Q: useQuery(['estoque', filtros])
    alt Cache fresh (menor que staleTime)
        Q-->>H: data em memória
        H-->>UI: render imediato
    else Cache stale ou vazio
        Q->>SB: from('estoque').select().limit(500)
        SB->>PG: GET /rest/v1/estoque + JWT
        PG->>RLS: USING (has_role(uid,'admin') OR owner=uid)
        alt Autorizado
            RLS->>DB: SELECT ...
            DB-->>PG: rows
            PG-->>SB: 200 JSON
            SB-->>Q: data
            Q->>Q: set cache + schedule gc
            Q-->>H: data
            H-->>UI: render com dados
        else Negado
            RLS-->>PG: 0 rows / 403
            PG-->>SB: erro
            SB-->>Q: sem retry em 401/403
            Q-->>H: error
            H-->>UI: ErrorBoundary / toast
        end
    end
```

### Sequência de uma Mutação com Invalidação + Realtime

```mermaid
sequenceDiagram
    autonumber
    participant UI as Form
    participant M as useMutation
    participant SB as supabase-js
    participant DB as Postgres
    participant RT as Realtime Channel
    participant Q as QueryClient
    participant OTHER as Outras Abas/Usuários

    UI->>M: mutate(payload)
    M->>SB: insert/update + RLS WITH CHECK
    SB->>DB: SQL + audit trigger
    DB-->>SB: row retornada
    SB-->>M: success
    M->>Q: invalidateQueries(['estoque'])
    Q->>UI: refetch automático
    DB-->>RT: postgres_changes (broadcast)
    RT-->>OTHER: evento INSERT/UPDATE
    OTHER->>Q: invalidateQueries(['estoque'])
```

### Fluxo via Edge Function (`external-db-bridge`)

```mermaid
sequenceDiagram
    autonumber
    participant UI as Componente
    participant H as Hook
    participant SB as supabase.functions
    participant EF as Edge Function
    participant SR as service_role client
    participant DB as Postgres
    participant T as query_telemetry

    UI->>H: ação (telemetria / query complexa)
    H->>SB: invoke('external-db-bridge', { action, payload })
    SB->>EF: POST + JWT do usuário
    EF->>EF: validateTelemetryPayload()
    EF->>SR: createClient(SERVICE_ROLE)
    SR->>DB: SELECT / INSERT
    DB-->>SR: resultado
    SR-->>EF: data
    EF->>T: fire-and-forget insert (slow/error)
    EF-->>SB: JSON { success, data, severity }
    SB-->>H: resposta
    H-->>UI: atualiza estado
```

### Avaliação de RLS (detalhe)

```mermaid
flowchart TD
    REQ[Request com JWT] --> JWT{JWT válido?}
    JWT -->|não| R401[401 Unauthorized]
    JWT -->|sim| ROLE[Extrai auth.uid + role]
    ROLE --> POL{Policy USING<br/>retorna true?}
    POL -->|não| R403[403 / 0 rows]
    POL -->|sim, é write| CHK{WITH CHECK<br/>retorna true?}
    POL -->|sim, é read| OK
    CHK -->|não| R403
    CHK -->|sim| OK[Executa SQL]
    OK --> TRG[Triggers: audit_log,<br/>updated_at, telemetry]
    TRG --> RESP[Resposta ao cliente]
```

---

## 📁 Mapa do Projeto e Responsabilidades

Estrutura inspirada em Clean Architecture adaptada para Vite + Serverless.

### Frontend (`src/`)

| Camada        | Responsabilidade                               | Exemplo                          |
| ------------- | ---------------------------------------------- | -------------------------------- |
| `components/` | Componentes de UI puros e reutilizáveis.       | `Button.tsx`, `DataTable.tsx`    |
| `hooks/`      | Orquestração de estado e chamadas assíncronas. | `useRealtime.ts`, `useCRUD.ts`   |
| `features/`   | Domínios verticais (hooks + pages + services). | `features/inventory`, `shipping` |
| `pages/`      | Composição de componentes para formar telas.   | `Dashboard.tsx`, `Estoque.tsx`   |
| `services/`   | Acesso a dados e regras de domínio.            | `authService.ts`                 |
| `lib/`        | Utilitários puros sem efeitos colaterais.      | `logger.ts`, `cn.ts`             |
| `types/`      | Contratos de interface e tipos do banco.       | `database.types.ts`              |

### Backend (`supabase/`)

| Camada        | Responsabilidade                                |
| ------------- | ----------------------------------------------- |
| `functions/`  | Lógica de servidor segura (Edge Functions).     |
| `migrations/` | Definição de tabelas, triggers e Políticas RLS. |

---

## 🌉 Contratos da Edge Function: `external-db-bridge`

Proxy seguro para telemetria e consultas auditadas.

### Endpoint: `POST /external-db-bridge`

#### Request Body

```json
{
  "action": "emit_telemetry | query_telemetry | cleanup_telemetry",
  "payload": { "operation": "string", "duration_ms": 0 }
}
```

#### Response (Sucesso)

```json
{
  "success": true,
  "severity": "normal | slow | very_slow | error",
  "persisted": true
}
```

#### Erros Padronizados

| Código | Motivo                                    |
| ------ | ----------------------------------------- |
| `400`  | Payload inválido ou ação não reconhecida. |
| `401`  | Token JWT inválido ou expirado.           |
| `403`  | Violação de Política RLS.                 |
| `500`  | Falha interna na execução.                |

---

## 🛠️ Padrões de Desenvolvimento

1. **Segurança (RLS):** todas as tabelas públicas com RLS habilitado e GRANT explícito.
2. **Performance:** cache agressivo com TanStack Query, `limit(500)` em queries genéricas.
3. **Auditabilidade:** triggers para `audit_log` e telemetria slow/error em `query_telemetry`.
4. **Testabilidade:** Vitest (unit) + Playwright (E2E) bloqueando merges no CI.

---

## 🧪 Estratégia de Testes

### E2E (`tests/e2e/`)

Playwright cobre login/logout, rotas protegidas, persistência de sessão e fluxos críticos. Relatórios HTML + traces publicados como artifacts no GitHub Actions.

### Unitários e Integração

Vitest + React Testing Library próximos aos componentes (`__tests__/`).

```bash
npm run test       # unitários
npm run test:e2e   # ponta a ponta
```
