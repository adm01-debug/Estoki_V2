/**
 * API Client para Produção
 * Cliente HTTP robusto com retry, timeout, cache e tratamento de erros
 */

import { envConfig } from './environment';

// Tipos
interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  cached: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Cache em memória
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

// Limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}

// Intervalo de limpeza
setInterval(cleanExpiredCache, 60000);

// Função de delay para retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Classe principal do API Client
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultConfig: RequestConfig;

  constructor(baseUrl: string, defaultConfig?: RequestConfig) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultConfig = {
      timeout: envConfig.limits.apiTimeout,
      retries: 3,
      retryDelay: 1000,
      cache: false,
      cacheTTL: envConfig.limits.cacheExpiry,
      ...defaultConfig,
    };
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<Response> {
    const { timeout, retries, retryDelay } = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (retries || 0); attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options, timeout!);

        // Retry em erros de servidor (5xx)
        if (response.status >= 500 && attempt < (retries || 0)) {
          await delay(retryDelay! * Math.pow(2, attempt));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Se foi abortado (timeout) ou é último retry, não tentar mais
        if ((error as Error).name === 'AbortError' || attempt >= (retries || 0)) {
          break;
        }

        await delay(retryDelay! * Math.pow(2, attempt));
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private getCacheKey(method: string, url: string, body?: any): string {
    return `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    memoryCache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number) {
    memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Verificar cache (apenas para GET)
    if (method === 'GET' && mergedConfig.cache) {
      const cacheKey = mergedConfig.cacheKey || this.getCacheKey(method, url);
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          status: 200,
          headers: new Headers(),
          cached: true,
        };
      }
    }

    const options: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...mergedConfig.headers,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await this.fetchWithRetry(url, options, mergedConfig);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
          code: errorData.code,
          details: errorData,
        };
        throw error;
      }

      const data = await response.json();

      // Salvar no cache se aplicável
      if (method === 'GET' && mergedConfig.cache) {
        const cacheKey = mergedConfig.cacheKey || this.getCacheKey(method, url);
        this.setCache(cacheKey, data, mergedConfig.cacheTTL!);
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        cached: false,
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw { message: 'Request timeout', code: 'TIMEOUT' } as ApiError;
      }
      throw error;
    }
  }

  // Métodos convenientes
  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  post<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>('POST', endpoint, body, config);
  }

  put<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>('PUT', endpoint, body, config);
  }

  patch<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>('PATCH', endpoint, body, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // Limpar todo o cache
  clearCache() {
    memoryCache.clear();
  }

  // Invalidar cache específico
  invalidateCache(pattern: string) {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
}

// Instância padrão
export const apiClient = new ApiClient(envConfig.apiUrl);

// Export para criação de clientes customizados
export { ApiClient };
export type { RequestConfig, ApiResponse, ApiError };
