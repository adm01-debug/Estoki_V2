# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Componentes extraídos de TrocasDevolucoes: StatusBadge, TipoBadge, WorkflowProgress
- Componente StatusCicloCard para InventarioCiclico
- Componente KPITrendIndicator para indicadores de tendência
- Componente PosicaoStatusBadge para status de posições
- Componente ReportFilters para filtros de relatórios
- Componente QuickActionButton para ações rápidas
- Integração DefeitoHistorico em FormularioTriagem
- Integração VolumeContagem em ConferenciaRecebimento
- Integração GeradorEtiquetas com Dialog em Estoque
- Pull-to-refresh em Triagem (usePullToRefresh + PullToRefreshIndicator)
- useAuditLog integrado em Estoque para auditoria de ações
- Testes para useGamificacao, useFornecedores, useInventarioCiclico
- Configuração Prettier (.prettierrc, .prettierignore)
- GitHub Actions CI workflow (lint, typecheck, test, build)
- CONTRIBUTING.md com guia de contribuição

### Corrigido
- Imports corrompidos em Estoque.tsx (prefixo "Printer," removido)

### Alterado
- TrocasDevolucoes agora importa componentes de @/components/trocas

## [1.0.0] - 2025-12-21

### Adicionado
- Sistema completo de gestão de estoque WMS
- Dashboard com KPIs operacionais em tempo real
- Scanner QR Code e OCR para identificação de produtos
- Gestão de recebimento e conferência
- Sistema de triagem com timer e fotos obrigatórias
- Armazenamento com mapa visual de posições
- Inventário cíclico com contagem por curva ABC
- Sistema de trocas e devoluções
- Romaneios de entrega
- Relatórios de divergências e fornecedores
- Sistema de gamificação (pontos, níveis, conquistas)
- Desafios diários para operadores
- Alertas inteligentes configuráveis
- Notificações push e sonoras
- Tema claro/escuro
- Responsivo para mobile e desktop
