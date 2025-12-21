# Guia Mobile/PWA - ESTOKI

## Progressive Web App (PWA)

O ESTOKI é uma PWA que pode ser instalada em dispositivos móveis.

## Instalação

### Android
1. Abrir no Chrome
2. Menu (⋮) > "Adicionar à tela inicial"
3. Confirmar instalação

### iOS
1. Abrir no Safari
2. Compartilhar (↑) > "Adicionar à Tela de Início"
3. Confirmar

### Desktop
1. Chrome: Ícone de instalação na barra de endereço
2. Edge: "Apps" > "Instalar este site como app"

## Recursos Offline

### Páginas Disponíveis Offline
- ✅ Dashboard
- ✅ Scanner
- ✅ Últimos dados sincronizados

### Sincronização
- Dados são sincronizados quando online
- Indicador de status de conexão
- Queue de ações offline

## Otimizações Mobile

### Touch Gestures
- Swipe para ações rápidas
- Pull-to-refresh
- Pinch to zoom em imagens

### Responsividade
- Layout adaptativo
- Navegação bottom-bar
- Cards empilháveis

## Service Worker

```javascript
// sw.js - Cache estratégico
const CACHE_NAME = "estoki-v1";
const OFFLINE_URL = "/offline.html";

// Cache de assets estáticos
// Network-first para API
// Cache-first para imagens
```

## Push Notifications

### Permissões
```typescript
const permission = await Notification.requestPermission();
if (permission === "granted") {
  // Registrar para push
}
```

### Tipos de Notificação
- 🔔 Alertas de estoque
- ✅ Tarefas concluídas
- ⚠️ Divergências
- 🏆 Conquistas

## Checklist PWA

- [ ] manifest.json completo
- [ ] Service Worker registrado
- [ ] Ícones em todos os tamanhos
- [ ] Splash screens
- [ ] Offline fallback
- [ ] HTTPS habilitado

## Debugging

### Chrome DevTools
1. F12 > Application > Service Workers
2. Manifest
3. Cache Storage

### Lighthouse
```bash
# Auditar PWA
lighthouse https://estoki.app --view
```

