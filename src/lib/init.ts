// App Initialization
import { initializeApp as initConfig } from '@/config';
import { registerServiceWorker, requestNotificationPermission } from '@/lib/register-sw';
import { setupGlobalErrorHandler } from '@/config/error-handler';
import { initPerformanceTracking } from '@/config/analytics';

interface InitOptions {
  enablePWA?: boolean;
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
}

export async function initializeApp(options: InitOptions = {}): Promise<void> {
  const {
    enablePWA = true,
    enableNotifications = true,
    enableAnalytics = true,
    enableErrorTracking = true,
  } = options;

  if (import.meta.env.DEV) console.log('[App] Initializing ESTOKI WMS...');

  try {
    // 1. Initialize config and validate
    initConfig();
    if (import.meta.env.DEV) console.log('[App] Configuration validated');

    // 2. Setup error tracking
    if (enableErrorTracking) {
      setupGlobalErrorHandler();
      if (import.meta.env.DEV) console.log('[App] Error tracking enabled');
    }

    // 3. Initialize analytics
    if (enableAnalytics) {
      initPerformanceTracking();
      if (import.meta.env.DEV) console.log('[App] Analytics enabled');
    }

    // 4. Register service worker
    if (enablePWA && import.meta.env.PROD) {
      const registration = await registerServiceWorker();
      if (registration) {
        if (import.meta.env.DEV) console.log('[App] PWA enabled');

        // 5. Request notification permission
        if (enableNotifications) {
          const permission = await requestNotificationPermission();
          if (import.meta.env.DEV) console.log('[App] Notification permission:', permission);
        }
      }
    }

    if (import.meta.env.DEV) console.log('[App] ESTOKI WMS initialized successfully!');
  } catch (error) {
    if (import.meta.env.DEV) console.error('[App] Initialization failed:', error);
    throw error;
  }
}

// Check if app is running as PWA
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen to online/offline events
export function onConnectivityChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export default initializeApp;
