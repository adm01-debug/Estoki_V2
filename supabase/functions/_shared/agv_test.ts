import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildVda5050Order, dispatchOrder } from "./agv.ts";

Deno.test("buildVda5050Order — 2 stops, 1 edge, versão 2.0.0", () => {
  const o = buildVda5050Order({
    manufacturer: "Kuka", serialNumber: "AGV-01",
    orderId: "m1", origem: "A-01-01", destino: "B-02-05",
    actions: [{ actionType: "drop", actionId: "act1" }],
  });
  assertEquals(o.version, "2.0.0");
  assertEquals(o.nodes.length, 2);
  assertEquals(o.edges.length, 1);
  assertEquals(o.nodes[1].actions?.length, 1);
  assertEquals(o.edges[0].startNodeId, "A-01-01");
  assertEquals(o.edges[0].endNodeId, "B-02-05");
});

Deno.test("buildVda5050Order — apenas destino gera 1 nó, sem arestas", () => {
  const o = buildVda5050Order({ manufacturer: "X", serialNumber: "s", orderId: "m", destino: "Z-01" });
  assertEquals(o.nodes.length, 1);
  assertEquals(o.edges.length, 0);
});

Deno.test("dispatchOrder — sem endpoint entra em simulação", async () => {
  const order = buildVda5050Order({ manufacturer: "x", serialNumber: "s", orderId: "m", destino: "D" });
  const r = await dispatchOrder({ protocol: "vda5050", order });
  assert(r.success);
  assert(r.simulated);
  assertEquals(r.order_id, "m");
});

Deno.test("dispatchOrder — HTTP 200 retorna success=true", async () => {
  const order = buildVda5050Order({ manufacturer: "x", serialNumber: "s", orderId: "m", destino: "D" });
  const fakeFetch = ((): typeof fetch =>
    (async () => new Response(JSON.stringify({ ack: true }), { status: 200 })) as unknown as typeof fetch)();
  const r = await dispatchOrder({ protocol: "vda5050", endpoint: "https://agv.local/order",
    order, fetchImpl: fakeFetch });
  assert(r.success);
  assert(!r.simulated);
  assertEquals(r.http_status, 200);
});

Deno.test("dispatchOrder — HTTP 500 marca error", async () => {
  const order = buildVda5050Order({ manufacturer: "x", serialNumber: "s", orderId: "m", destino: "D" });
  const fakeFetch = ((): typeof fetch =>
    (async () => new Response("boom", { status: 500 })) as unknown as typeof fetch)();
  const r = await dispatchOrder({ protocol: "vda5050", endpoint: "https://agv.local/order",
    order, fetchImpl: fakeFetch });
  assert(!r.success);
  assertEquals(r.http_status, 500);
  assert(r.error);
});
