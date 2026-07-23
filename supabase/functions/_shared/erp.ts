/**
 * Cliente HTTP compartilhado para integrações ERP (SAP Business One Service Layer
 * e TOTVS Protheus/RM REST). Concentra:
 *   - Autenticação (session-cookie SAP; bearer TOTVS).
 *   - Retries exponenciais (429/5xx/network) com jitter.
 *   - Timeout por request (AbortController).
 *   - Circuit breaker por host (evita martelar ERP em queda).
 *   - Modo simulação quando credenciais ausentes (útil em DEV/preview).
 *
 * Não persiste dados; quem chama grava em `integration_logs`.
 */

export class MissingErpCredentialsError extends Error {
  constructor(msg = "Credenciais do ERP ausentes") {
    super(msg);
    this.name = "MissingErpCredentialsError";
  }
}

export class ErpCircuitOpenError extends Error {
  constructor(host: string) {
    super(`Circuito ERP aberto para ${host}`);
    this.name = "ErpCircuitOpenError";
  }
}

type BreakerState = { failures: number; openedAt: number | null };
const breakers = new Map<string, BreakerState>();
const BREAKER_THRESHOLD = 5;
const BREAKER_COOLDOWN_MS = 30_000;

function hostOf(url: string): string {
  try { return new URL(url).host; } catch { return url; }
}

function checkBreaker(host: string) {
  const b = breakers.get(host);
  if (!b || !b.openedAt) return;
  if (Date.now() - b.openedAt > BREAKER_COOLDOWN_MS) {
    breakers.set(host, { failures: 0, openedAt: null });
    return;
  }
  throw new ErpCircuitOpenError(host);
}

function recordFailure(host: string) {
  const b = breakers.get(host) ?? { failures: 0, openedAt: null };
  b.failures += 1;
  if (b.failures >= BREAKER_THRESHOLD) b.openedAt = Date.now();
  breakers.set(host, b);
}

function recordSuccess(host: string) {
  breakers.set(host, { failures: 0, openedAt: null });
}

export interface ErpFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryOn?: number[];
}

export async function erpFetch(url: string, opts: ErpFetchOptions = {}): Promise<Response> {
  const {
    timeoutMs = 15_000,
    retries = 3,
    retryOn = [408, 429, 500, 502, 503, 504],
    ...init
  } = opts;

  const host = hostOf(url);
  checkBreaker(host);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      clearTimeout(timer);
      if (retryOn.includes(res.status) && attempt < retries) {
        await sleep(backoff(attempt));
        continue;
      }
      if (res.ok) recordSuccess(host);
      else recordFailure(host);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      recordFailure(host);
      if (attempt < retries) await sleep(backoff(attempt));
    }
  }
  throw lastErr ?? new Error("erpFetch: falha desconhecida");
}

function backoff(attempt: number): number {
  const base = Math.min(2_000 * 2 ** attempt, 8_000);
  return base + Math.floor(Math.random() * 250);
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ---------- SAP Business One (Service Layer) ----------

export interface SapConfig {
  base_url: string;
  company_db?: string;
  username?: string;
  password?: string;
  session_id?: string;
}

export async function sapLogin(cfg: SapConfig): Promise<{ SessionId: string; SessionTimeout?: number }> {
  if (!cfg.base_url || !cfg.company_db || !cfg.username || !cfg.password) {
    throw new MissingErpCredentialsError("SAP: base_url, company_db, username e password obrigatórios");
  }
  const res = await erpFetch(`${cfg.base_url.replace(/\/$/, "")}/b1s/v1/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      CompanyDB: cfg.company_db,
      UserName: cfg.username,
      Password: cfg.password,
    }),
  });
  if (!res.ok) throw new Error(`SAP login falhou (${res.status})`);
  return await res.json();
}

export function sapHeaders(sessionId: string): HeadersInit {
  return {
    Cookie: `B1SESSION=${sessionId}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ---------- TOTVS (Protheus/RM REST) ----------

export interface TotvsConfig {
  base_url: string;
  token?: string;
  username?: string;
  password?: string;
}

export function totvsHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function isSimulationMode(cfg: { base_url?: string } & Record<string, unknown>): boolean {
  if (Deno.env.get("ERP_SIMULATION") === "1") return true;
  return !cfg?.base_url;
}