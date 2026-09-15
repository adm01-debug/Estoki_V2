// Cliente para integração AGV — subset do padrão VDA 5050 (Association of German
// Automotive Industry) usado por fabricantes como Kuka, Jungheinrich, Still.
// Suporta modo SIMULATION quando não há endpoint configurado.

export type AgvProtocol = "vda5050" | "rest" | "mqtt" | "custom";

export interface Vda5050Node {
  nodeId: string;
  sequenceId: number;
  released: boolean;
  nodePosition?: { x: number; y: number; mapId?: string };
  actions?: Vda5050Action[];
}

export interface Vda5050Action {
  actionType: string;             // pick, drop, wait, charge...
  actionId: string;
  actionDescription?: string;
  blockingType?: "NONE" | "SOFT" | "HARD";
  actionParameters?: Array<{ key: string; value: string | number | boolean }>;
}

export interface Vda5050Order {
  headerId: number;
  timestamp: string;              // ISO 8601
  version: string;                // "2.0.0"
  manufacturer: string;
  serialNumber: string;
  orderId: string;
  orderUpdateId: number;
  nodes: Vda5050Node[];
  edges: Array<{ edgeId: string; sequenceId: number; startNodeId: string; endNodeId: string; released: boolean }>;
}

export interface DispatchResult {
  success: boolean;
  simulated: boolean;
  order_id: string;
  http_status?: number;
  response?: unknown;
  error?: string;
}

/** Monta um payload VDA 5050 v2 válido a partir de campos simplificados. */
export function buildVda5050Order(input: {
  manufacturer: string;
  serialNumber: string;
  orderId: string;
  origem?: string | null;
  destino: string;
  actions?: Vda5050Action[];
}): Vda5050Order {
  const stops = [input.origem, input.destino].filter(Boolean) as string[];
  const nodes: Vda5050Node[] = stops.map((stop, idx) => ({
    nodeId: stop,
    sequenceId: idx * 2,          // pares: nós; ímpares: arestas
    released: true,
    actions: idx === stops.length - 1 ? input.actions ?? [] : [],
  }));
  const edges = nodes.slice(0, -1).map((n, idx) => ({
    edgeId: `${n.nodeId}->${nodes[idx + 1].nodeId}`,
    sequenceId: idx * 2 + 1,
    startNodeId: n.nodeId,
    endNodeId: nodes[idx + 1].nodeId,
    released: true,
  }));
  return {
    headerId: Date.now() & 0xffffffff,
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    manufacturer: input.manufacturer,
    serialNumber: input.serialNumber,
    orderId: input.orderId,
    orderUpdateId: 0,
    nodes,
    edges,
  };
}

/** Envia a ordem ao AGV. Sem endpoint → modo simulação (retorna sucesso). */
export async function dispatchOrder(opts: {
  protocol: AgvProtocol;
  endpoint?: string | null;
  headers?: Record<string, string>;
  order: Vda5050Order;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<DispatchResult> {
  const orderId = opts.order.orderId;
  if (!opts.endpoint) {
    return { success: true, simulated: true, order_id: orderId };
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
  try {
    const f = opts.fetchImpl ?? fetch;
    const res = await f(opts.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
      body: JSON.stringify(opts.order),
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown = text;
    try { parsed = JSON.parse(text); } catch { /* keep text */ }
    return {
      success: res.ok,
      simulated: false,
      order_id: orderId,
      http_status: res.status,
      response: parsed,
      error: res.ok ? undefined : `AGV rejected order (HTTP ${res.status})`,
    };
  } catch (e) {
    return {
      success: false,
      simulated: false,
      order_id: orderId,
      error: (e as Error).message,
    };
  } finally {
    clearTimeout(t);
  }
}
