/**
 * ESTOKI Plugin SDK — v0.1 (MVP).
 *
 * Um plugin é um módulo JS/TS que exporta `default: EstokiPlugin`. Ele pode:
 *  - registrar itens de menu (`nav`),
 *  - registrar rotas (`routes`) que são montadas dentro do shell autenticado,
 *  - registrar widgets no dashboard (`widgets`),
 *  - registrar handlers para eventos do domínio (`on`).
 *
 * O host injeta um `PluginContext` tipado — plugins NUNCA importam o cliente
 * Supabase diretamente; usam `ctx.api` e `ctx.supabase` (escopado pelo host).
 */
import type { ComponentType, ReactNode } from "react";

export type EstokiEvent =
  | { type: "lote.recebido"; payload: { loteId: string; produtoId: string } }
  | { type: "picking.confirmado"; payload: { pickingId: string; operadorId: string } }
  | { type: "estoque.ajustado"; payload: { produtoId: string; delta: number } }
  | { type: "xp.ganho"; payload: { userId: string; xp: number; tipo: string } };

export interface PluginNavItem {
  label: string;
  path: string;
  icon?: string;
  requiresRole?: "admin" | "supervisor" | "operador";
}

export interface PluginRoute {
  path: string;
  element: ReactNode | ComponentType;
  requiresRole?: "admin" | "supervisor" | "operador";
}

export interface PluginWidget {
  id: string;
  title: string;
  component: ComponentType<{ ctx: PluginContext }>;
  colSpan?: 1 | 2 | 3 | 4;
}

export interface PluginContext {
  version: string;
  tenantId: string | null;
  userId: string | null;
  toast: (msg: string, opts?: { type?: "success" | "error" | "info" }) => void;
  /** Invoca uma Edge Function do host. */
  invoke: <T = unknown>(name: string, body?: unknown) => Promise<T>;
  /** Leitura direcionada; escrita ainda passa por Edge Functions do host. */
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T>;
  /** Logger estruturado que respeita o env do host. */
  log: (level: "info" | "warn" | "error", msg: string, meta?: Record<string, unknown>) => void;
}

export interface EstokiPlugin {
  id: string; // ex: "com.acme.frete-extra"
  name: string;
  version: string; // semver
  minHostVersion: string; // semver
  description?: string;
  author?: string;
  permissions?: Array<"read:estoque" | "read:pedidos" | "write:notificacoes" | "invoke:ai">;
  nav?: PluginNavItem[];
  routes?: PluginRoute[];
  widgets?: PluginWidget[];
  on?: Partial<{
    [K in EstokiEvent["type"]]: (
      event: Extract<EstokiEvent, { type: K }>,
      ctx: PluginContext
    ) => void | Promise<void>;
  }>;
  onActivate?: (ctx: PluginContext) => void | Promise<void>;
  onDeactivate?: (ctx: PluginContext) => void | Promise<void>;
}

export const HOST_VERSION = "1.0.0";

export function definePlugin(p: EstokiPlugin): EstokiPlugin {
  return p;
}

/** Compara versões semver simples (major.minor.patch). */
export function satisfiesMinVersion(host: string, min: string): boolean {
  const parse = (v: string) => v.split(".").map((n) => parseInt(n, 10) || 0);
  const [h1, h2, h3] = parse(host);
  const [m1, m2, m3] = parse(min);
  if (h1 !== m1) return h1 > m1;
  if (h2 !== m2) return h2 > m2;
  return h3 >= m3;
}
