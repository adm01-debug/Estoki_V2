# 📡 Services — ESTOKI WMS

Documentação dos serviços e camadas de abstração do sistema.

## Camada de Serviços

| Serviço | Arquivo | Responsabilidade |
|---|---|---|
| **AuthService** | `src/services/authService.ts` | Login, logout, signup, refresh token, password reset |
| **API Client** | `src/config/api-client.ts` | Client HTTP centralizado com interceptors e retry |
| **Bitrix24 Client** | `src/config/bitrix24-client.ts` | Integração com CRM Bitrix24 (pedidos, contatos) |

## Hooks de Dados (TanStack Query)

| Hook | Domínio | Operações |
|---|---|---|
| `useEstoque` | Posições de estoque | CRUD, filtros por zona/status |
| `useLotes` | Lotes/Recebimento | CRUD, conferência, divergências |
| `useTriagem` | Triagem/QC | Início, finalização, fotos, checklist |
| `useTarefas` | Tarefas operacionais | Atribuição, conclusão, priorização |
| `useOndas` | Ondas de separação | Criação, progresso, conclusão |
| `useMovimentacao` | Movimentações | Transferências, ajustes, aprovações |
| `useRomaneios` | Romaneios de entrega | Criação, itens, comprovantes |
| `useInventario` | Inventário cíclico | Ciclos, contagens, divergências |
| `useGamificacao` | Gamificação | XP, conquistas, desafios, streaks |
| `useAlertasInteligentes` | Alertas | Config, histórico, reconhecimento |

## Edge Functions (Backend)

### Autenticação & Segurança
| Função | Endpoint | Descrição |
|---|---|---|
| `auth-login` | POST | Login com email/senha |
| `auth-register` | POST | Registro de novo usuário |
| `auth-2fa-setup` | POST | Configuração de MFA/TOTP |
| `auth-2fa-verify` | POST | Verificação de código MFA |
| `check-permission` | POST | Verificação de permissões RBAC |
| `get-permissions` | GET | Lista permissões do usuário autenticado |

### Operações WMS
| Função | Endpoint | Descrição |
|---|---|---|
| `nfe-import` | POST | Importação de XML NF-e |
| `generate-pdf-report` | POST | Geração de relatórios PDF |
| `generate-pick-list` | POST | Lista de picking otimizada |
| `wave-planning` | POST | Planejamento de ondas de separação |
| `inventory-reconcile` | POST | Reconciliação de inventário |
| `demand-forecast` | POST | Previsão de demanda via IA |
| `abc-analysis` | POST | Análise de curva ABC |

### Integrações Externas
| Função | Endpoint | Descrição |
|---|---|---|
| `carrier-quote` | POST | Cotação de frete (Correios, Jadlog) |
| `carrier-track` | POST | Rastreamento de envios |
| `send-email` | POST | Envio de e-mails via Resend |
| `notification-whatsapp` | POST | Notificações WhatsApp |
| `sync-external-api` | POST | Sincronização com ERPs |

### Utilitários
| Função | Endpoint | Descrição |
|---|---|---|
| `health` | GET | Health check do sistema |
| `export-data` | POST | Exportação de dados (CSV/Excel) |
| `upload-file` | POST | Upload de arquivos (fotos triagem) |

## Padrões de Integração

### Circuit Breaker
Todas as integrações externas utilizam o `CircuitBreaker` (`src/lib/circuit-breaker.ts`):

```typescript
import { circuits } from '@/lib/circuit-breaker';

const data = await circuits.correios.execute(() =>
  fetch('https://api.correios.com.br/...').then(r => r.json())
);
```

### Realtime
Tabelas com atualização em tempo real via Supabase Realtime:
- `notificacoes` — Notificações push
- `tarefas` — Status de tarefas
- `posicoes_estoque` — Posições de estoque

### State Machines
Transições de status validadas via `src/lib/state-machines.ts`:
- **Lotes**: aguardando → em_transito → recebido → conferido
- **Tarefas**: pendente → atribuida → em_andamento → concluida
- **Ondas**: pendente → em_andamento → concluida
- **Entregas**: pendente → em_rota → entregue
