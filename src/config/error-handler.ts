/**
 * Error Handler Global para Produção
 * Tratamento centralizado de erros com logging e notificação
 */

import { envConfig, isProduction } from './environment';

// Tipos de erro
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OFFLINE = 'OFFLINE',
  RATE_LIMITED = 'RATE_LIMITED',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: any;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
}

// Mensagens amigáveis para o usuário
const userMessages: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet.',
  [ErrorCode.TIMEOUT]: 'A requisição demorou muito. Tente novamente.',
  [ErrorCode.UNAUTHORIZED]: 'Sessão expirada. Faça login novamente.',
  [ErrorCode.FORBIDDEN]: 'Você não tem permissão para esta ação.',
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos.',
  [ErrorCode.SERVER_ERROR]: 'Erro no servidor. Tente novamente em instantes.',
  [ErrorCode.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado.',
  [ErrorCode.OFFLINE]: 'Você está offline. Verifique sua conexão.',
  [ErrorCode.RATE_LIMITED]: 'Muitas requisições. Aguarde um momento.',
};

// Converter erro HTTP para ErrorCode
function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 401: return ErrorCode.UNAUTHORIZED;
    case 403: return ErrorCode.FORBIDDEN;
    case 404: return ErrorCode.NOT_FOUND;
    case 422: return ErrorCode.VALIDATION_ERROR;
    case 429: return ErrorCode.RATE_LIMITED;
    default:
      if (status >= 500) return ErrorCode.SERVER_ERROR;
      return ErrorCode.UNKNOWN_ERROR;
  }
}

// Criar AppError a partir de qualquer erro
export function createAppError(
  error: unknown,
  context?: Record<string, any>
): AppError {
  const timestamp = new Date().toISOString();

  // Já é um AppError
  if (isAppError(error)) {
    return { ...error, context: { ...error.context, ...context } };
  }

  // Erro de rede/offline
  if (!navigator.onLine) {
    return {
      code: ErrorCode.OFFLINE,
      message: 'No internet connection',
      userMessage: userMessages[ErrorCode.OFFLINE],
      timestamp,
      context,
    };
  }

  // Erro com status HTTP
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as { status: number; message?: string };
    const code = httpStatusToErrorCode(httpError.status);
    return {
      code,
      message: httpError.message || `HTTP ${httpError.status}`,
      userMessage: userMessages[code],
      details: error,
      timestamp,
      context,
    };
  }

  // Erro padrão do JavaScript
  if (error instanceof Error) {
    const isTimeout = error.name === 'AbortError' || (error instanceof Error ? error.message : String(error)).includes('timeout');
    const isNetwork = (error instanceof Error ? error.message : String(error)).includes('fetch') || (error instanceof Error ? error.message : String(error)).includes('network');

    const code = isTimeout
      ? ErrorCode.TIMEOUT
      : isNetwork
      ? ErrorCode.NETWORK_ERROR
      : ErrorCode.UNKNOWN_ERROR;

    return {
      code,
      message: (error instanceof Error ? error.message : String(error)),
      userMessage: userMessages[code],
      stack: error.stack,
      timestamp,
      context,
    };
  }

  // Erro desconhecido
  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    userMessage: userMessages[ErrorCode.UNKNOWN_ERROR],
    details: error,
    timestamp,
    context,
  };
}

// Type guard para AppError
export function isAppError(error: unknown): error is AppError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'userMessage' in error &&
    'timestamp' in error
  );
}

// Log de erro (dev: console, prod: serviço externo)
export async function logError(error: AppError): Promise<void> {
  // Sempre logar no console em dev
  if (!isProduction()) {
    console.error('[ERROR]', {
      code: error.code,
      message: (error instanceof Error ? error.message : String(error)),
      context: error.context,
      stack: error.stack,
    });
    return;
  }

  // Em produção, enviar para serviço de monitoramento
  try {
    // Sentry integration
    if (envConfig.sentryDsn && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error((error instanceof Error ? error.message : String(error))), {
        tags: { errorCode: error.code },
        extra: {
          context: error.context,
          details: error.details,
        },
      });
    }

    // Também pode enviar para endpoint próprio
    if (envConfig.apiUrl) {
      await fetch(`${envConfig.apiUrl}/api/logs/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(() => {}); // Silencioso se falhar
    }
  } catch {
    // Log silencioso - não queremos erro ao logar erro
    console.error('[ERROR LOG FAILED]', error);
  }
}

// Handler global para erros não capturados
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  // Erros JS não capturados
  window.onerror = (message, source, lineno, colno, error) => {
    const appError = createAppError(error || message, {
      source,
      lineno,
      colno,
    });
    logError(appError);
    return false; // Continua propagação padrão
  };

  // Promises não tratadas
  window.onunhandledrejection = (event) => {
    const appError = createAppError(event.reason, {
      type: 'unhandledrejection',
    });
    logError(appError);
  };

  // Monitorar status online/offline
  window.addEventListener('online', () => {
    console.log('[NETWORK] Back online');
  });

  window.addEventListener('offline', () => {
    console.log('[NETWORK] Went offline');
    const appError = createAppError(new Error('Connection lost'), {
      type: 'offline',
    });
    logError(appError);
  });
}

// Hook para usar em componentes React
export function useErrorHandler() {
  const handleError = (error: unknown, context?: Record<string, any>) => {
    const appError = createAppError(error, context);
    logError(appError);
    return appError;
  };

  return { handleError, createAppError };
}
