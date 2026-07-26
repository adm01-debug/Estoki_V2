/**
 * Structured logging for Edge Functions (P2 #26 — Observabilidade).
 *
 * Emits single-line JSON so Supabase Logs / any log shipper (Loki, Datadog,
 * CloudWatch) can parse fields without regex. Never logs secrets: the payload
 * is shallow-redacted for known-sensitive keys.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEY = /(pass(word)?|token|secret|apikey|api_key|authorization|cookie|cpf|cnpj)/i;

/** Shallow redaction of sensitive fields before serialization. */
export function redact(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = SENSITIVE_KEY.test(k) ? "[REDACTED]" : v;
  }
  return out;
}

export interface LoggerContext {
  fn: string;
  requestId: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private readonly ctx: LoggerContext) {}

  child(extra: Record<string, unknown>): Logger {
    return new Logger({ ...this.ctx, ...extra });
  }

  log(level: LogLevel, message: string, fields: Record<string, unknown> = {}): void {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg: message,
      ...redact(this.ctx),
      ...redact(fields),
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  debug = (m: string, f?: Record<string, unknown>) => this.log("debug", m, f);
  info = (m: string, f?: Record<string, unknown>) => this.log("info", m, f);
  warn = (m: string, f?: Record<string, unknown>) => this.log("warn", m, f);
  error = (m: string, f?: Record<string, unknown>) => this.log("error", m, f);
}

/** Correlation id: reuses inbound header when present so traces stitch across hops. */
export function requestIdFrom(req: Request): string {
  return (
    req.headers.get("x-request-id") ??
    req.headers.get("x-correlation-id") ??
    crypto.randomUUID()
  );
}

export function createLogger(fn: string, req: Request): Logger {
  return new Logger({ fn, requestId: requestIdFrom(req) });
}

/**
 * Wraps a handler with request/response structured logs and duration tracking.
 * Always attaches `x-request-id` to the response for client-side correlation.
 */
export function withLogging(
  fn: string,
  handler: (req: Request, log: Logger) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const requestId = requestIdFrom(req);
    const log = new Logger({ fn, requestId });
    const started = performance.now();
    log.info("request.start", { method: req.method, path: new URL(req.url).pathname });
    try {
      const res = await handler(req, log);
      const durationMs = Math.round(performance.now() - started);
      log.info("request.end", { status: res.status, duration_ms: durationMs });
      const headers = new Headers(res.headers);
      headers.set("x-request-id", requestId);
      return new Response(res.body, { status: res.status, headers });
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      log.error("request.failed", {
        duration_ms: durationMs,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };
}
