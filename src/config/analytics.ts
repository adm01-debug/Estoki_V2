/**
 * Analytics & Monitoring para Produção
 * Tracking de eventos, métricas de negócio e performance
 */

import { envConfig, isProduction } from './environment';

// Tipos de eventos
export enum EventCategory {
  USER = 'user',
  INVENTORY = 'inventory',
  RECEIVING = 'receiving',
  SHIPPING = 'shipping',
  PICKING = 'picking',
  ERROR = 'error',
  PERFORMANCE = 'performance',
}

export enum EventAction {
  // User
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAGE_VIEW = 'page_view',
  // Inventory
  STOCK_UPDATE = 'stock_update',
  INVENTORY_COUNT = 'inventory_count',
  LOW_STOCK_ALERT = 'low_stock_alert',
  // Receiving
  RECEIPT_CREATED = 'receipt_created',
  RECEIPT_COMPLETED = 'receipt_completed',
  // Shipping
  SHIPMENT_CREATED = 'shipment_created',
  SHIPMENT_DISPATCHED = 'shipment_dispatched',
  // Picking
  PICK_STARTED = 'pick_started',
  PICK_COMPLETED = 'pick_completed',
  // Error
  API_ERROR = 'api_error',
  VALIDATION_ERROR = 'validation_error',
  // Performance
  PAGE_LOAD = 'page_load',
  API_LATENCY = 'api_latency',
}

interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Session ID único por sessão
const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Fila de eventos para batch processing
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

// Função para enviar eventos em batch
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    // Google Analytics 4
    if (envConfig.gaTrackingId && typeof window !== 'undefined' && (window as any).gtag) {
      eventsToSend.forEach((event) => {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.metadata,
        });
      });
    }

    // Backend próprio para métricas de negócio
    if (envConfig.apiUrl && isProduction()) {
      await fetch(`${envConfig.apiUrl}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      }).catch(() => {}); // Silencioso se falhar
    }
  } catch {
    // Re-adicionar eventos à fila em caso de falha
    eventQueue = [...eventsToSend, ...eventQueue].slice(0, 1000);
  }
}

// Agendar flush
function scheduleFlush(): void {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushEvents();
  }, 5000); // Flush a cada 5 segundos
}

// Função principal de tracking
export function trackEvent(
  category: EventCategory,
  action: EventAction,
  options?: {
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
    userId?: string;
  }
): void {
  const event: AnalyticsEvent = {
    category,
    action,
    label: options?.label,
    value: options?.value,
    metadata: options?.metadata,
    timestamp: new Date().toISOString(),
    userId: options?.userId,
    sessionId,
  };

  // Em dev, apenas logar no console
  if (!isProduction()) {
    console.log('[ANALYTICS]', event);
    return;
  }

  eventQueue.push(event);
  scheduleFlush();
}

// Helpers específicos por domínio
export const analytics = {
  // User events
  userLogin: (userId: string, method?: string) =>
    trackEvent(EventCategory.USER, EventAction.LOGIN, {
      userId,
      label: method,
    }),

  userLogout: (userId: string) =>
    trackEvent(EventCategory.USER, EventAction.LOGOUT, { userId }),

  pageView: (path: string, title?: string) =>
    trackEvent(EventCategory.USER, EventAction.PAGE_VIEW, {
      label: path,
      metadata: { title },
    }),

  // Inventory events
  stockUpdate: (productId: string, oldQty: number, newQty: number) =>
    trackEvent(EventCategory.INVENTORY, EventAction.STOCK_UPDATE, {
      label: productId,
      value: newQty - oldQty,
      metadata: { oldQty, newQty },
    }),

  lowStockAlert: (productId: string, currentQty: number, minQty: number) =>
    trackEvent(EventCategory.INVENTORY, EventAction.LOW_STOCK_ALERT, {
      label: productId,
      value: currentQty,
      metadata: { minQty },
    }),

  // Receiving events
  receiptCreated: (receiptId: string, supplierId: string, itemCount: number) =>
    trackEvent(EventCategory.RECEIVING, EventAction.RECEIPT_CREATED, {
      label: receiptId,
      value: itemCount,
      metadata: { supplierId },
    }),

  // Shipping events
  shipmentDispatched: (shipmentId: string, carrierId: string, itemCount: number) =>
    trackEvent(EventCategory.SHIPPING, EventAction.SHIPMENT_DISPATCHED, {
      label: shipmentId,
      value: itemCount,
      metadata: { carrierId },
    }),

  // Performance events
  pageLoad: (path: string, loadTimeMs: number) =>
    trackEvent(EventCategory.PERFORMANCE, EventAction.PAGE_LOAD, {
      label: path,
      value: loadTimeMs,
    }),

  apiLatency: (endpoint: string, latencyMs: number, status: number) =>
    trackEvent(EventCategory.PERFORMANCE, EventAction.API_LATENCY, {
      label: endpoint,
      value: latencyMs,
      metadata: { status },
    }),

  // Error events
  apiError: (endpoint: string, status: number, message: string) =>
    trackEvent(EventCategory.ERROR, EventAction.API_ERROR, {
      label: endpoint,
      value: status,
      metadata: { message },
    }),
};

// Inicializar tracking de performance automático
export function initPerformanceTracking(): void {
  if (typeof window === 'undefined') return;

  // Page load timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      analytics.pageLoad(window.location.pathname, loadTime);
    }, 0);
  });

  // Track SPA navigation (se usar React Router ou similar)
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    analytics.pageView(window.location.pathname, document.title);
  };
}

// Flush eventos antes de fechar página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEvents);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

export default analytics;
