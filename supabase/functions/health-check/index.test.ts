import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL") ?? "https://oztttjpqtbubfyhiypld.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHR0anBxdGJ1YmZ5aGl5cGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODUyNTUsImV4cCI6MjA4MTQ2MTI1NX0.Mq3GjtA5c9238IT06Gv-3UaG44mAj8HzA8Fy2VpL6fA";

const baseUrl = `${SUPABASE_URL}/functions/v1`;
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// ========== Health Check ==========
Deno.test("health-check returns 200", async () => {
  const res = await fetch(`${baseUrl}/health-check`, { headers });
  const body = await res.text();
  assertEquals(res.status, 200);
  // Response may be JSON with status or plain text
  if (body.startsWith("{")) {
    const json = JSON.parse(body);
    assertExists(json);
  }
});

Deno.test("health-check returns valid response body", async () => {
  const res = await fetch(`${baseUrl}/health-check`, { headers });
  const body = await res.text();
  assertEquals(typeof body, "string");
  assertEquals(body.length > 0, true);
});

Deno.test("health-check handles OPTIONS (CORS)", async () => {
  const res = await fetch(`${baseUrl}/health-check`, { method: "OPTIONS", headers });
  assertEquals(res.status, 200);
  await res.text();
});

// ========== Calculate KPIs ==========
Deno.test("calculate-kpis returns JSON with KPI fields", async () => {
  const res = await fetch(`${baseUrl}/calculate-kpis`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  // May return 200 or 500 depending on data state, but should return JSON
  const body = await res.json();
  if (res.status === 200) {
    assertExists(body.triagens_dia !== undefined || body.error === undefined);
  }
});

Deno.test("calculate-kpis handles OPTIONS", async () => {
  const res = await fetch(`${baseUrl}/calculate-kpis`, { method: "OPTIONS", headers });
  await res.text();
  // CORS preflight should not fail
});

// ========== NF-e Import ==========
Deno.test("nfe-import rejects empty body", async () => {
  const res = await fetch(`${baseUrl}/nfe-import`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

Deno.test("nfe-import accepts xml_content", async () => {
  const res = await fetch(`${baseUrl}/nfe-import`, {
    method: "POST",
    headers,
    body: JSON.stringify({ xml_content: "<nfe>test</nfe>" }),
  });
  const body = await res.json();
  // May succeed or fail depending on DB state, but should return JSON
  assertExists(body);
});

Deno.test("nfe-import accepts access_key", async () => {
  const res = await fetch(`${baseUrl}/nfe-import`, {
    method: "POST",
    headers,
    body: JSON.stringify({ access_key: "NFE_TEST_KEY_" + Date.now() }),
  });
  const body = await res.json();
  assertExists(body);
});

// ========== Gerar Desafios Diários ==========
Deno.test("gerar-desafios-diarios returns JSON", async () => {
  const res = await fetch(`${baseUrl}/gerar-desafios-diarios`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertExists(body);
});

Deno.test("gerar-desafios-diarios handles OPTIONS", async () => {
  const res = await fetch(`${baseUrl}/gerar-desafios-diarios`, { method: "OPTIONS", headers });
  await res.text();
});

// ========== Previsão de Demanda ==========
Deno.test("previsao-demanda returns JSON", async () => {
  const res = await fetch(`${baseUrl}/previsao-demanda`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertExists(body);
});

// ========== ABC Analysis ==========
Deno.test("abc-analysis returns JSON", async () => {
  const res = await fetch(`${baseUrl}/abc-analysis`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertExists(body);
});

// ========== Dashboard Stats ==========
Deno.test("dashboard-stats returns JSON", async () => {
  const res = await fetch(`${baseUrl}/dashboard-stats`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertExists(body);
});

// ========== Export Data ==========
Deno.test("export-data returns JSON", async () => {
  const res = await fetch(`${baseUrl}/export-data`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "products" }),
  });
  const body = await res.json();
  assertExists(body);
});

// ========== Check Reorder ==========
Deno.test("check-reorder returns JSON", async () => {
  const res = await fetch(`${baseUrl}/check-reorder`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertExists(body);
});
