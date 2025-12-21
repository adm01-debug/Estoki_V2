# Catálogo de Componentes ESTOKI

## 📁 Estrutura de Componentes

```
src/components/
├── armazenamento/      # Componentes de armazenamento
├── dashboard/          # Widgets e componentes do dashboard
├── estoque/           # Componentes de gestão de estoque
├── etiquetas/         # Geração de etiquetas
├── fornecedores/      # Gestão de fornecedores
├── gamificacao/       # Sistema de gamificação
├── inventario/        # Inventário cíclico
├── kpis/             # Indicadores de performance
├── layout/           # Layout e navegação
├── mobile/           # Componentes mobile-first
├── onboarding/       # Tour guiado para novos usuários
├── relatorios/       # Componentes de relatórios
├── scanner/          # QR Code e OCR
├── theme/            # Tema e estilos
├── triagem/          # Sistema de triagem
├── trocas/           # Trocas e devoluções
└── ui/               # Componentes base (shadcn/ui)
```

## 🎯 Componentes Principais

### Layout
- **AppLayout** - Layout principal com sidebar e header
- **PageTransition** - Animações de transição entre páginas

### Dashboard
- **ProgressRing** - Anel de progresso circular
- **QuickActionButton** - Botões de ação rápida

### Triagem
- **AmostragemAutomatica** - Calculadora de amostragem
- **DefeitoHistorico** - Histórico de defeitos por produto
- **VolumeContagem** - Contagem por volume
- **TriagemTimer** - Timer de triagem
- **FotosLoteObrigatorias** - Captura de fotos

### Estoque
- **NovaPosicaoDialog** - Criar nova posição
- **PosicaoDetalhesDialog** - Detalhes da posição

### Trocas
- **StatusBadge** - Badge de status
- **TipoBadge** - Badge de tipo (troca/devolução)
- **WorkflowProgress** - Progresso do workflow

### Scanner
- **QRScanner** - Leitor de QR Code
- **ScannerOCR** - Reconhecimento de texto

### Mobile
- **SwipeableListItem** - Item com swipe actions
- **PullToRefreshIndicator** - Indicador de pull-to-refresh

## 🔧 Uso

```tsx
import { StatusBadge } from "@/components/trocas";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { DefeitoHistorico } from "@/components/triagem/DefeitoHistorico";

// Exemplos de uso
<StatusBadge status="aprovado" />
<ProgressRing value={75} label="Progresso" />
<DefeitoHistorico sku="PROD-001" produto="Caneta" historico={[]} totalTriagens={10} />
```
