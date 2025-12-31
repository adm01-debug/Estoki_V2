# 📦 ESTOKI WMS - Documentação Técnica Completa

> **Versão:** 1.0.0  
> **Data:** 30/12/2024  
> **Projeto:** Sistema WMS (Warehouse Management System)

---

## 📑 Índice

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Autenticação e Segurança](#2-autenticação-e-segurança)
3. [Dashboard e KPIs](#3-dashboard-e-kpis)
4. [Gestão de Estoque](#4-gestão-de-estoque)
5. [Recebimento](#5-recebimento)
6. [Triagem e Qualidade](#6-triagem-e-qualidade)
7. [Separação (Picking)](#7-separação-picking)
8. [Ondas de Separação](#8-ondas-de-separação)
9. [Expedição (Shipping)](#9-expedição-shipping)
10. [Transportadoras](#10-transportadoras)
11. [Inventário Cíclico](#11-inventário-cíclico)
12. [Scanner e Códigos de Barras](#12-scanner-e-códigos-de-barras)
13. [Gamificação](#13-gamificação)
14. [Alertas e Notificações](#14-alertas-e-notificações)
15. [Relatórios e Exportação](#15-relatórios-e-exportação)
16. [Trocas e Devoluções](#16-trocas-e-devoluções)
17. [Mapas e Geolocalização](#17-mapas-e-geolocalização)
18. [Inteligência Artificial](#18-inteligência-artificial)
19. [PWA e Mobile](#19-pwa-e-mobile)
20. [UI/UX Components](#20-uiux-components)
21. [Integrações Externas](#21-integrações-externas)
22. [Armazenamento e Arquivos](#22-armazenamento-e-arquivos)
23. [Agendamento e Jobs](#23-agendamento-e-jobs)
24. [Realtime](#24-realtime)
25. [Monitoramento e Logs](#25-monitoramento-e-logs)
26. [Utilitários](#26-utilitários)
27. [Banco de Dados](#27-banco-de-dados)

---

## 1. Stack Tecnológico

### 1.1 Frontend Core

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Framework SPA | React | ^18.3.1 |
| Bundler | Vite | - |
| Linguagem | TypeScript | - |
| Estilização | Tailwind CSS | - |
| Animações CSS | tailwindcss-animate | ^1.0.7 |

### 1.2 UI Components

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Component Library Base | Radix UI (shadcn/ui) | Múltiplas |
| Accordion | @radix-ui/react-accordion | ^1.2.11 |
| Alert Dialog | @radix-ui/react-alert-dialog | ^1.1.14 |
| Aspect Ratio | @radix-ui/react-aspect-ratio | ^1.1.7 |
| Avatar | @radix-ui/react-avatar | ^1.1.10 |
| Checkbox | @radix-ui/react-checkbox | ^1.3.2 |
| Collapsible | @radix-ui/react-collapsible | ^1.1.11 |
| Context Menu | @radix-ui/react-context-menu | ^2.2.15 |
| Dialog/Modal | @radix-ui/react-dialog | ^1.1.14 |
| Dropdown Menu | @radix-ui/react-dropdown-menu | ^2.1.15 |
| Hover Card | @radix-ui/react-hover-card | ^1.1.14 |
| Label | @radix-ui/react-label | ^2.1.7 |
| Menubar | @radix-ui/react-menubar | ^1.1.15 |
| Navigation Menu | @radix-ui/react-navigation-menu | ^1.2.13 |
| Popover | @radix-ui/react-popover | ^1.1.14 |
| Progress | @radix-ui/react-progress | ^1.1.7 |
| Radio Group | @radix-ui/react-radio-group | ^1.3.7 |
| Scroll Area | @radix-ui/react-scroll-area | ^1.2.9 |
| Select | @radix-ui/react-select | ^2.2.5 |
| Separator | @radix-ui/react-separator | ^1.1.7 |
| Slider | @radix-ui/react-slider | ^1.3.5 |
| Slot | @radix-ui/react-slot | ^1.2.3 |
| Switch | @radix-ui/react-switch | ^1.2.5 |
| Tabs | @radix-ui/react-tabs | ^1.1.12 |
| Toast | @radix-ui/react-toast | ^1.2.14 |
| Toggle | @radix-ui/react-toggle | ^1.1.9 |
| Toggle Group | @radix-ui/react-toggle-group | ^1.1.10 |
| Tooltip | @radix-ui/react-tooltip | ^1.2.7 |

### 1.3 Estado e Data Fetching

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Estado Global | Zustand | ^4.5.0 |
| Estado Imutável | Immer | ^10.0.3 |
| Estado Atômico | Jotai | ^2.6.0 |
| Data Fetching/Cache | TanStack React Query | ^5.83.0 |

### 1.4 Formulários e Validação

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Gerenciamento de Forms | React Hook Form | ^7.61.1 |
| Resolvers de Validação | @hookform/resolvers | ^3.10.0 |
| Validação Schema (Primary) | Zod | ^3.25.76 |
| Validação Schema (Secondary) | Yup | ^1.3.0 |

### 1.5 Roteamento

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Roteamento SPA | React Router DOM | ^6.30.1 |

### 1.6 Backend

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Backend as a Service | Lovable Cloud (Supabase) | - |
| Cliente Supabase | @supabase/supabase-js | ^2.87.3 |
| Banco de Dados | PostgreSQL | - |
| Edge Functions | Deno Runtime | - |

### 1.7 Animações

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Animações Avançadas | Framer Motion | ^12.23.26 |
| Animações Spring | @react-spring/web | ^9.7.0 |

### 1.8 Datas

| Funcionalidade | Ferramenta/Biblioteca | Versão |
|----------------|----------------------|--------|
| Manipulação de Datas (Primary) | date-fns | ^3.6.0 |
| Manipulação de Datas (Secondary) | dayjs | ^1.11.10 |
| Date Picker | react-day-picker | ^8.10.1 |

---

## 2. Autenticação e Segurança

### 2.1 Autenticação

| Funcionalidade | Implementação | Localização |
|----------------|---------------|-------------|
| Login/Signup | Supabase Auth | `src/pages/Auth.tsx` |
| Proteção de Rotas | AuthGuard HOC | `src/components/auth/AuthGuard.tsx` |
| Controle por Role | RoleGuard HOC | `src/components/auth/RoleGuard.tsx` |
| Controle por Permissão | PermissionGuard | `src/components/auth/PermissionGuard.tsx` |
| Middleware de Auth | authMiddleware | `src/middleware/authMiddleware.ts` |
| JWT Tokens | Supabase JWT | Automático |
| Reset de Senha | Password Reset | `src/pages/ResetPassword.tsx` |

### 2.2 Controle de Acesso (RBAC)

| Role | Descrição | Enum |
|------|-----------|------|
| Operador | Usuário básico | `operador` |
| Supervisor | Supervisão de equipe | `supervisor` |
| Admin | Acesso total | `admin` |

### 2.3 Funções de Segurança (Database)

| Função | Descrição | Localização |
|--------|-----------|-------------|
| `get_user_role` | Retorna role do usuário | DB Function |
| `has_role` | Verifica se usuário tem role | DB Function |

### 2.4 Rate Limiting

| Funcionalidade | Edge Function |
|----------------|---------------|
| Rate Limiting Geral | `rate-limit` |

---

## 3. Dashboard e KPIs

### 3.1 Componentes de Dashboard

| Funcionalidade | Componente | Localização |
|----------------|------------|-------------|
| Dashboard Principal | Dashboard | `src/pages/Dashboard.tsx` |
| Cards de KPI | KPICard | `src/components/dashboard/KPICard.tsx` |
| Gráficos de Performance | PerformanceChart | `src/components/dashboard/PerformanceChart.tsx` |
| Resumo de Atividades | ActivitySummary | `src/components/dashboard/ActivitySummary.tsx` |

### 3.2 Bibliotecas de Gráficos

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Gráficos Recharts | Recharts | ^2.15.4 |
| Gráficos Victory | Victory | ^36.8.0 |

### 3.3 Edge Functions de Dashboard

| Funcionalidade | Edge Function |
|----------------|---------------|
| Estatísticas do Dashboard | `dashboard-stats` |

### 3.4 Métricas Calculadas

| Métrica | Descrição |
|---------|-----------|
| Taxa de Ocupação | % de posições ocupadas |
| Acuracidade de Picking | % de picks corretos |
| Tempo Médio de Separação | Média de tempo por pedido |
| Volumes Recebidos | Total de volumes no dia |
| Itens Triados | Total de itens triados |
| Taxa de Aprovação | % de aprovação na triagem |

---

## 4. Gestão de Estoque

### 4.1 Componentes de Estoque

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Visão Geral de Estoque | `src/pages/Estoque.tsx` |
| Posições de Estoque | `src/pages/Posicoes.tsx` |
| Gestão de Produtos | `src/pages/Produtos.tsx` |
| Gestão de Lotes | `src/pages/Lotes.tsx` |

### 4.2 Edge Functions de Estoque

| Funcionalidade | Edge Function |
|----------------|---------------|
| Reserva de Estoque | `stock-reserve` |
| Liberação de Estoque | `stock-release` |
| Transferência de Estoque | `stock-transfer` |
| Ajuste de Estoque | `stock-adjust` |
| Snapshot de Estoque | `stock-snapshot` |
| Reconciliação | `stock-reconcile` |
| Valoração de Estoque | `stock-valuation` |
| Movimentação Geral | `stock-movement` |
| Análise ABC | `abc-analysis` |
| Verificação Ponto Pedido | `check-reorder-point` |
| Estoque de Segurança | `safety-stock-calc` |

### 4.3 Estratégias de Picking

| Estratégia | Descrição |
|------------|-----------|
| FIFO | First In, First Out |
| FEFO | First Expire, First Out |
| LIFO | Last In, First Out |

### 4.4 Curva ABC

| Classificação | Critério |
|---------------|----------|
| A | Alto giro (80% do movimento) |
| B | Médio giro (15% do movimento) |
| C | Baixo giro (5% do movimento) |

---

## 5. Recebimento

### 5.1 Componentes de Recebimento

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Lista de Recebimentos | `src/pages/Recebimento.tsx` |
| Conferência de NF | `src/components/recebimento/ConferenciaNF.tsx` |
| Formulário de Recebimento | `src/components/recebimento/RecebimentoForm.tsx` |

### 5.2 Edge Functions de Recebimento

| Funcionalidade | Edge Function |
|----------------|---------------|
| Criar Recebimento | `receiving-create` |
| Confirmar Recebimento | `receiving-confirm` |
| Inspeção de Recebimento | `receiving-inspection` |
| Armazenar Recebimento | `receiving-putaway` |
| Rejeitar Recebimento | `receiving-reject` |
| Cancelar Recebimento | `receiving-cancel` |

### 5.3 Processamento de Documentos

| Funcionalidade | Edge Function/Utilitário |
|----------------|-------------------------|
| Processar NF-e | `process-nfe` |
| Parse de XML NF-e | `src/utils/nfeParser.ts` |
| Parse de CT-e | `parse-cte` |

### 5.4 Status de Recebimento

| Status | Enum |
|--------|------|
| Aguardando | `aguardando` |
| Em Trânsito | `em_transito` |
| Recebido | `recebido` |
| Em Conferência | `em_conferencia` |
| Conferido | `conferido` |
| Divergência | `divergencia` |
| Cancelado | `cancelado` |

---

## 6. Triagem e Qualidade

### 6.1 Componentes de Triagem

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Página de Triagem | `src/pages/Triagem.tsx` |
| Formulário de Triagem | `src/components/triagem/TriagemForm.tsx` |

### 6.2 Edge Functions de Triagem

| Funcionalidade | Edge Function |
|----------------|---------------|
| Iniciar Triagem | `triage-start` |
| Completar Triagem | `triage-complete` |
| Inspeção de Qualidade | `quality-inspection` |
| Controle de Qualidade | `quality-control` |

### 6.3 Resultados de Triagem

| Resultado | Descrição |
|-----------|-----------|
| Aprovado | Produto OK para estoque |
| Reprovado | Produto com defeito |
| Parcial | Parte aprovada, parte reprovada |

---

## 7. Separação (Picking)

### 7.1 Componentes de Picking

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Lista de Tarefas | `src/pages/Tarefas.tsx` |
| Execução de Picking | `src/components/picking/PickingExecution.tsx` |
| Scanner de Picking | `src/components/picking/PickingScanner.tsx` |

### 7.2 Edge Functions de Picking

| Funcionalidade | Edge Function |
|----------------|---------------|
| Atribuir Picking | `picking-assign` |
| Picking em Lote | `picking-batch` |
| Confirmar Picking | `picking-confirm` |
| Cancelar Picking | `picking-cancel` |
| Dividir Picking | `picking-split` |
| Pular Item | `picking-skip` |
| Otimização de Rota | `picking-route-optimize` |
| Gerar Lista de Picking | `picking-list-generate` |

### 7.3 Status de Tarefa

| Status | Enum |
|--------|------|
| Pendente | `pendente` |
| Atribuída | `atribuida` |
| Em Andamento | `em_andamento` |
| Concluída | `concluida` |
| Bloqueada | `bloqueada` |

### 7.4 Prioridades

| Prioridade | Enum |
|------------|------|
| Baixa | `baixa` |
| Média | `media` |
| Alta | `alta` |
| Urgente | `urgente` |

---

## 8. Ondas de Separação

### 8.1 Componentes de Ondas

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Gestão de Ondas | `src/pages/Ondas.tsx` |
| Planejamento de Ondas | `src/components/ondas/WavePlanning.tsx` |

### 8.2 Edge Functions de Ondas

| Funcionalidade | Edge Function |
|----------------|---------------|
| Criar Onda | `wave-create` |
| Planejar Onda | `wave-plan` |
| Liberar Onda | `wave-release` |
| Cancelar Onda | `wave-cancel` |
| Mesclar Ondas | `wave-merge` |
| Dividir Onda | `wave-split` |
| Otimizar Onda | `wave-optimize` |

### 8.3 Status de Onda

| Status | Enum |
|--------|------|
| Pendente | `pendente` |
| Em Andamento | `em_andamento` |
| Concluída | `concluida` |
| Cancelada | `cancelada` |

---

## 9. Expedição (Shipping)

### 9.1 Componentes de Expedição

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Gestão de Romaneios | `src/pages/Romaneios.tsx` |
| Detalhe de Romaneio | `src/pages/RomaneioDetalhe.tsx` |
| Comprovante de Entrega | `src/components/expedicao/ComprovanteEntrega.tsx` |

### 9.2 Edge Functions de Expedição

| Funcionalidade | Edge Function |
|----------------|---------------|
| Criar Embarque | `shipment-create` |
| Gerar Etiqueta de Envio | `shipping-label` |
| Gerar Manifesto | `shipping-manifest` |
| Comprovante de Entrega | `proof-of-delivery` |
| Cálculo de Frete | `freight-calculate` |
| Rastreamento | `shipment-tracking` |
| Cancelar Embarque | `shipment-cancel` |

### 9.3 Status de Romaneio

| Status | Enum |
|--------|------|
| Rascunho | `rascunho` |
| Confirmado | `confirmado` |
| Em Trânsito | `em_transito` |
| Entregue | `entregue` |
| Parcial | `parcial` |
| Cancelado | `cancelado` |

### 9.4 Status de Entrega

| Status | Enum |
|--------|------|
| Pendente | `pendente` |
| Em Rota | `em_rota` |
| Entregue | `entregue` |
| Recusado | `recusado` |
| Parcial | `parcial` |
| Reagendado | `reagendado` |

---

## 10. Transportadoras

### 10.1 Edge Functions de Transportadoras

| Funcionalidade | Edge Function |
|----------------|---------------|
| Integração Transportadora | `carrier-integration` |
| Cotação de Frete | `carrier-quote` |
| Cotação Correios | `correios-quote` |
| Cotação Jadlog | `jadlog-quote` |
| Booking de Transporte | `carrier-booking` |
| Cancelar Transporte | `carrier-cancel` |
| Tracking de Transporte | `carrier-tracking` |
| Webhook de Transportadora | `carrier-webhook` |
| Cache de Tarifas | `carrier-rates-cache` |

---

## 11. Inventário Cíclico

### 11.1 Componentes de Inventário

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Gestão de Inventário | `src/pages/Inventario.tsx` |
| Execução de Contagem | `src/components/inventario/ContagemExecution.tsx` |

### 11.2 Edge Functions de Inventário

| Funcionalidade | Edge Function |
|----------------|---------------|
| Contagem Cíclica | `cycle-count` |
| Serviço de Contagem | `counting-service` |

### 11.3 Status de Ciclo

| Status | Enum |
|--------|------|
| Agendado | `agendado` |
| Em Andamento | `em_andamento` |
| Concluído | `concluido` |
| Cancelado | `cancelado` |

### 11.4 Status de Contagem

| Status | Enum |
|--------|------|
| Pendente | `pendente` |
| Em Andamento | `em_andamento` |
| Concluído | `concluido` |
| Divergência | `divergencia` |

---

## 12. Scanner e Códigos de Barras

### 12.1 Componentes de Scanner

| Funcionalidade | Componente |
|----------------|------------|
| Scanner Universal | `src/components/scanner/BarcodeScanner.tsx` |
| Scanner com Câmera | `src/components/scanner/CameraScanner.tsx` |
| Scanner HTML5 | `src/components/scanner/Html5Scanner.tsx` |
| Geração de QR Code | `src/components/scanner/QRCodeGenerator.tsx` |

### 12.2 Bibliotecas de Scanner

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Leitura de Barcode | @zxing/library | ^0.20.0 |
| Scanner HTML5 | html5-qrcode | ^2.3.8 |
| Leitura QR JS | jsqr | ^1.4.0 |
| Geração de Barcode | jsbarcode | ^3.11.6 |
| Geração de QR Code | qrcode | ^1.5.4 |
| QR Code React | qrcode.react | ^3.1.0 |

### 12.3 Edge Functions de Scanner

| Funcionalidade | Edge Function |
|----------------|---------------|
| Validar EAN | `validate-ean` |
| Gerar Código de Barras | `generate-barcode` |
| OCR de Documento | `ocr-document` |
| Impressão de Etiquetas | `print-labels` |

---

## 13. Gamificação

### 13.1 Componentes de Gamificação

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Dashboard de Gamificação | `src/pages/Gamificacao.tsx` |
| Card de XP | `src/components/gamificacao/XPCard.tsx` |
| Lista de Conquistas | `src/components/gamificacao/AchievementsList.tsx` |
| Ranking | `src/components/gamificacao/Leaderboard.tsx` |

### 13.2 Edge Functions de Gamificação

| Funcionalidade | Edge Function |
|----------------|---------------|
| Gerar Desafios Diários | `generate-daily-challenges` |

### 13.3 Funções de Banco de Dados

| Função | Descrição |
|--------|-----------|
| `adicionar_xp` | Adiciona XP ao usuário e calcula nível |
| `registrar_checkin_diario` | Registra check-in e atualiza streak |

### 13.4 Tabelas de Gamificação

| Tabela | Descrição |
|--------|-----------|
| `gamificacao_usuarios` | XP e nível dos usuários |
| `conquistas_definicoes` | Definições de conquistas |
| `conquistas_usuarios` | Conquistas desbloqueadas |
| `desafios_diarios` | Desafios disponíveis |
| `desafios_usuarios` | Progresso dos desafios |
| `streaks_usuarios` | Streaks de login |
| `streaks_historico` | Histórico de streaks |
| `xp_historico` | Histórico de XP ganho |

---

## 14. Alertas e Notificações

### 14.1 Componentes de Alertas

| Funcionalidade | Componente |
|----------------|------------|
| Centro de Notificações | `src/components/notifications/NotificationCenter.tsx` |
| Toast de Alerta | Sonner | 

### 14.2 Biblioteca de Toast

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Toast Notifications | Sonner | ^1.7.4 |
| Toast Alternativo | react-hot-toast | ^2.4.0 |

### 14.3 Edge Functions de Alertas

| Funcionalidade | Edge Function |
|----------------|---------------|
| Enviar Notificação | `send-notification` |
| Enviar Push | `send-push` |
| Enviar Email | `send-email` |
| Enviar SMS | `send-sms` |
| Enviar WhatsApp | `send-whatsapp` |
| Notificação Slack | `slack-notification` |
| Alerta de Estoque | `stock-alert` |
| Alerta de Vencimento | `expiry-alert` |
| Alerta de SLA | `sla-alert` |

### 14.4 Tipos de Alerta

| Tipo | Enum |
|------|------|
| Estoque Mínimo | `estoque_minimo` |
| Estoque Máximo | `estoque_maximo` |
| Ponto de Pedido | `ponto_pedido` |
| Posição Ociosa | `posicao_ociosa` |
| Vencimento Próximo | `vencimento_proximo` |
| Gargalo de Triagem | `gargalo_triagem` |
| Divergência de Inventário | `divergencia_inventario` |
| Item sem Movimentação | `item_sem_movimentacao` |

### 14.5 Severidades

| Severidade | Enum |
|------------|------|
| Info | `info` |
| Aviso | `aviso` |
| Crítico | `critico` |
| Urgente | `urgente` |

---

## 15. Relatórios e Exportação

### 15.1 Componentes de Relatórios

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Central de Relatórios | `src/pages/Relatorios.tsx` |
| Exportador de Dados | `src/components/relatorios/DataExporter.tsx` |

### 15.2 Bibliotecas de Exportação

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Geração de Excel | exceljs | ^4.4.0 |
| Geração de XLSX | xlsx | ^0.18.5 |
| Geração de PDF | jspdf | ^3.0.4 |
| Manipulação de PDF | pdf-lib | ^1.17.1 |
| PDF React | @react-pdf/renderer | ^3.1.0 |

### 15.3 Edge Functions de Relatórios

| Funcionalidade | Edge Function |
|----------------|---------------|
| Gerar Excel | `generate-excel` |
| Exportar PDF | `export-pdf` |
| Gerar DANFE | `generate-danfe` |
| Exportar Produtos | `export-products` |
| Relatório Diário | `daily-report` |
| Relatório Semanal | `weekly-report` |
| Relatório Mensal | `monthly-report` |
| Relatório de Acuracidade | `accuracy-report` |
| Relatório de Performance | `performance-report` |
| Relatório de Fornecedores | `supplier-report` |
| Relatório de Giro | `turnover-report` |

---

## 16. Trocas e Devoluções

### 16.1 Componentes de TD

| Funcionalidade | Componente/Página |
|----------------|-------------------|
| Dashboard de TD | `src/pages/TrocasDevolucoes.tsx` |
| Formulário de TD | `src/components/td/TDForm.tsx` |

### 16.2 Edge Functions de TD

| Funcionalidade | Edge Function |
|----------------|---------------|
| Criar Ordem de Devolução | `return-order-create` |
| Processar Devolução | `return-process` |
| Gestão de Créditos | `credit-management` |

### 16.3 Tipos de Registro

| Tipo | Enum |
|------|------|
| Troca | `troca` |
| Devolução | `devolucao` |

### 16.4 Motivos

| Motivo | Enum |
|--------|------|
| Defeito | `defeito` |
| Cor Errada | `cor_errada` |
| Tamanho Errado | `tamanho_errado` |
| Quantidade Errada | `quantidade_errada` |
| Produto Errado | `produto_errado` |
| Avaria no Transporte | `avaria_transporte` |
| Desistência | `desistencia` |
| Outro | `outro` |

### 16.5 Status de TD

| Status | Enum |
|--------|------|
| Aberto | `aberto` |
| Em Análise | `em_analise` |
| Aprovado | `aprovado` |
| Recusado | `recusado` |
| Em Trânsito | `em_transito` |
| Recebido | `recebido` |
| Finalizado | `finalizado` |

---

## 17. Mapas e Geolocalização

### 17.1 Componentes de Mapa

| Funcionalidade | Componente |
|----------------|------------|
| Mapa de Entregas | `src/components/maps/DeliveryMap.tsx` |
| Mapa de Rotas | `src/components/maps/RouteMap.tsx` |

### 17.2 Bibliotecas de Mapa

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Mapas Leaflet | leaflet | ^1.9.4 |
| React Leaflet | react-leaflet | ^4.2.1 |

### 17.3 Hooks de Geolocalização

| Funcionalidade | Hook |
|----------------|------|
| Posição Atual | `useGeolocation` |
| Cálculo de Distância | `useDistance` |
| Geofencing | `useGeofencing` |

---

## 18. Inteligência Artificial

### 18.1 Modelos Suportados (Lovable AI)

| Modelo | Uso Recomendado |
|--------|-----------------|
| google/gemini-2.5-pro | Imagem+texto, raciocínio complexo |
| google/gemini-2.5-flash | Balanceado custo/performance |
| google/gemini-2.5-flash-lite | Tarefas simples, alta velocidade |
| openai/gpt-5 | Máxima precisão e nuance |
| openai/gpt-5-mini | Custo menor, boa qualidade |
| openai/gpt-5-nano | Alto volume, tarefas simples |

### 18.2 Edge Functions de IA

| Funcionalidade | Edge Function |
|----------------|---------------|
| Classificação AI | `ai-classify` |
| Completação de Texto | `ai-complete` |
| Embeddings | `ai-embeddings` |
| Sumarização | `ai-summarize` |
| Tradução | `ai-translate` |
| Previsão de Demanda | `demand-forecast` |
| Alerta de Divergência | `divergence-alert` |

---

## 19. PWA e Mobile

### 19.1 Configuração PWA

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Plugin PWA Vite | vite-plugin-pwa | ^1.2.0 |
| Precaching | workbox-precaching | ^7.0.0 |
| Routing | workbox-routing | ^7.0.0 |
| Window Utils | workbox-window | ^7.0.0 |

### 19.2 Hooks Mobile

| Funcionalidade | Hook |
|----------------|------|
| Detecção Mobile | `useIsMobile` |
| Status de Bateria | `useBattery` |
| Status de Rede | `useNetworkStatus` |
| Acesso à Câmera | `useCamera` |
| Bússola | `useCompass` |
| Orientação do Dispositivo | `useDeviceOrientation` |

---

## 20. UI/UX Components

### 20.1 Componentes Especiais

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Drag and Drop | @dnd-kit/core | ^6.1.0 |
| Sortable | @dnd-kit/sortable | ^8.0.0 |
| DnD Utilities | @dnd-kit/utilities | ^3.2.2 |
| Carousel | embla-carousel-react | ^8.6.0 |
| Rich Text Editor | @tiptap/react | ^2.1.0 |
| Tiptap Starter Kit | @tiptap/starter-kit | ^2.1.0 |
| Tiptap Placeholder | @tiptap/extension-placeholder | ^2.1.0 |
| Temas | next-themes | ^0.3.0 |
| Drawer/Sheet | vaul | ^0.9.9 |
| Command Palette | cmdk | ^1.1.1 |
| OTP Input | input-otp | ^1.4.2 |
| Resizable Panels | react-resizable-panels | ^2.1.9 |
| Virtual Lists | @tanstack/react-virtual | ^3.0.0 |

### 20.2 Utilitários de Estilo

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Class Variance | class-variance-authority | ^0.7.1 |
| Class Merge | tailwind-merge | ^2.6.0 |
| Conditional Classes | clsx | ^2.1.1 |

### 20.3 SEO

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| React Helmet | react-helmet-async | ^2.0.5 |

---

## 21. Integrações Externas

### 21.1 Edge Functions de Integração

| Funcionalidade | Edge Function |
|----------------|---------------|
| Integração ERP | `erp-integration` |
| Integração E-commerce | `ecommerce-integration` |
| Integração Marketplace | `marketplace-integration` |
| Integração Contabilidade | `integration-accounting` |
| Webhook Genérico | `webhook-handler` |
| Webhook de Entrada | `webhook-inbound` |
| Sync Externo | `external-sync` |
| Sync de Pedidos | `sync-orders` |
| Sync de Produtos | `sync-products` |
| Sync de Estoque | `sync-inventory` |

### 21.2 HTTP Client

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| HTTP Client Leve | ky | ^1.2.0 |
| HTTP Client Completo | axios | ^1.6.0 |

---

## 22. Armazenamento e Arquivos

### 22.1 Edge Functions de Storage

| Funcionalidade | Edge Function |
|----------------|---------------|
| Upload de Arquivo | `upload-file` |
| Download de Arquivo | `download-file` |
| Deletar Arquivo | `delete-file` |

### 22.2 Utilitários de Compressão

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Compressão de String | lz-string | ^1.5.0 |

---

## 23. Agendamento e Jobs

### 23.1 Edge Functions de Jobs

| Funcionalidade | Edge Function |
|----------------|---------------|
| Scheduler de Tarefas | `task-scheduler` |
| Jobs Diários | `daily-jobs` |
| Relatórios Agendados | `scheduled-reports` |
| Sync Agendado | `scheduled-sync` |
| Limpeza Automática | `cleanup-old-data` |
| Processador de Fila | `queue-processor` |
| Processamento em Lote | `batch-process` |

---

## 24. Realtime

### 24.1 Tecnologias Realtime

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Supabase Realtime | @supabase/supabase-js | ^2.87.3 |
| WebSockets | socket.io-client | ^4.7.0 |

### 24.2 Edge Functions Realtime

| Funcionalidade | Edge Function |
|----------------|---------------|
| Realtime Updates | `realtime-updates` |
| KPIs em Tempo Real | `realtime-kpis` |
| Broadcast de Eventos | `event-broadcast` |
| SSE Stream | `sse-stream` |

---

## 25. Monitoramento e Logs

### 25.1 Error Tracking

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Error Tracking | @sentry/react | ^8.0.0 |
| Error Boundary | react-error-boundary | ^4.0.0 |

### 25.2 Edge Functions de Monitoramento

| Funcionalidade | Edge Function |
|----------------|---------------|
| Health Check | `health-check` |
| Health Status | `health` |
| Audit Log | `audit-log` |
| Backup de Dados | `backup-data` |
| Migração de Dados | `data-migration` |

---

## 26. Utilitários

### 26.1 Utilitários de Formatação

| Funcionalidade | Localização |
|----------------|-------------|
| Formatadores de Data | `src/utils/dateFormatters.ts` |
| Formatadores de Número | `src/utils/numberFormatters.ts` |
| Formatadores de Moeda | `src/utils/currencyFormatters.ts` |

### 26.2 Utilitários de Validação

| Funcionalidade | Localização |
|----------------|-------------|
| Validadores de CPF/CNPJ | `src/utils/documentValidators.ts` |
| Validadores de Email | `src/utils/emailValidators.ts` |
| Validadores de Telefone | `src/utils/phoneValidators.ts` |

### 26.3 Utilitários Gerais

| Funcionalidade | Ferramenta | Versão |
|----------------|------------|--------|
| Lodash Modular | lodash-es | ^4.17.21 |
| Geração de IDs | nanoid | ^5.0.4 |

### 26.4 Edge Functions Utilitárias

| Funcionalidade | Edge Function |
|----------------|---------------|
| Gerar SKU | `generate-sku` |
| Importar CSV | `import-csv` |

---

## 27. Banco de Dados

### 27.1 Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários |
| `user_roles` | Roles dos usuários (RBAC) |
| `produtos` | Cadastro de produtos |
| `lotes` | Lotes de produtos |
| `posicoes_estoque` | Posições no armazém |
| `estoque_posicao` | Estoque por posição |
| `tarefas` | Tarefas de WMS |
| `ondas_separacao` | Ondas de picking |
| `romaneios` | Romaneios de entrega |
| `romaneio_itens` | Itens dos romaneios |
| `comprovantes_entrega` | Comprovantes de entrega |
| `inventario_ciclos` | Ciclos de inventário |
| `inventario_contagens` | Contagens de inventário |
| `inventario_config` | Configurações de inventário |
| `trocas_devolucoes` | Registros de TD |
| `alertas_config` | Configuração de alertas |
| `alertas_historico` | Histórico de alertas |
| `notificacoes` | Notificações do sistema |
| `metricas_operacionais` | Métricas diárias |
| `metas_kpi` | Metas de KPI |
| `produtividade_operador` | Produtividade por operador |
| `eventos_picking` | Eventos de picking |
| `eventos_triagem` | Eventos de triagem |
| `rastreamento_historico` | Histórico de rastreamento |
| `regras_ponto_pedido` | Regras de reposição |

### 27.2 Tabelas de Gamificação

| Tabela | Descrição |
|--------|-----------|
| `gamificacao_usuarios` | XP e níveis |
| `conquistas_definicoes` | Definições de conquistas |
| `conquistas_usuarios` | Conquistas desbloqueadas |
| `desafios_diarios` | Desafios do dia |
| `desafios_usuarios` | Progresso dos desafios |
| `streaks_usuarios` | Streaks de usuários |
| `streaks_historico` | Histórico de streaks |
| `xp_historico` | Histórico de XP |

### 27.3 Tipos de Posição

| Tipo | Enum |
|------|------|
| Porta Palete | `porta_palete` |
| Box | `box` |

### 27.4 Status de Posição

| Status | Enum |
|--------|------|
| Livre | `livre` |
| Ocupado | `ocupado` |
| Reservado | `reservado` |
| Bloqueado | `bloqueado` |

### 27.5 Tipos de Tarefa

| Tipo | Enum |
|------|------|
| Separação | `separacao` |
| Armazenagem | `armazenagem` |
| Transferência | `transferencia` |
| Inventário | `inventario` |
| Expedição | `expedicao` |

### 27.6 Tipos de Evento de Rastreamento

| Tipo | Enum |
|------|------|
| Recebimento NF | `recebimento_nf` |
| Conferência | `conferencia` |
| Início Triagem | `triagem_inicio` |
| Fim Triagem | `triagem_fim` |
| Armazenamento | `armazenamento` |
| Reserva | `reserva` |
| Separação | `separacao` |
| Conferência Expedição | `conferencia_expedicao` |
| Carregamento | `carregamento` |
| Saída Transporte | `saida_transporte` |
| Entrega | `entrega` |
| Devolução | `devolucao` |
| Ajuste de Estoque | `ajuste_estoque` |

---

## 📊 Resumo Estatístico

| Categoria | Quantidade |
|-----------|------------|
| Edge Functions | 100+ |
| Componentes React | 200+ |
| Hooks Customizados | 50+ |
| Tabelas de Banco | 30+ |
| Enums de Status | 15+ |
| Bibliotecas NPM | 80+ |

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Arquivos de Configuração

| Arquivo | Propósito |
|---------|-----------|
| `vite.config.ts` | Configuração do Vite |
| `tailwind.config.ts` | Configuração do Tailwind |
| `tsconfig.json` | Configuração do TypeScript |
| `supabase/config.toml` | Configuração do Supabase |
| `index.css` | Design System tokens |

---

> **Nota:** Esta documentação foi gerada em 30/12/2024 e representa o estado atual do sistema ESTOKI WMS.
