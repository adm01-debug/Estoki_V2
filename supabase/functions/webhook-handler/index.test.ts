 import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
 
 const BASE_URL = "http://localhost:54321/functions/v1/webhook-handler";
 
 Deno.test("webhook-handler: should fail on non-POST method", async () => {
   const res = await fetch(BASE_URL, { method: "GET" });
   assertEquals(res.status, 405);
   const body = await res.json();
   assertEquals(body.error, "Method not allowed");
 });
 
 Deno.test("webhook-handler: should fail on invalid payload", async () => {
   const res = await fetch(BASE_URL, {
     method: "POST",
     body: JSON.stringify({}),
     headers: { "Content-Type": "application/json" }
   });
   assertEquals(res.status, 400);
   const body = await res.json();
   assertEquals(body.error, "Validation failed");
 });
 
 Deno.test("webhook-handler: should handle fuzzing - very large string", async () => {
   const largeString = "a".repeat(1000000); // 1MB
   const res = await fetch(BASE_URL, {
     method: "POST",
     body: JSON.stringify({ event: largeString, data: {} }),
     headers: { "Content-Type": "application/json" }
   });
   // Should fail validation (max 200)
   assertEquals(res.status, 400);
 });
 
 Deno.test("webhook-handler: should handle fuzzing - malicious inputs", async () => {
   const maliciousInputs = [
     "'; DROP TABLE users; --",
     "<script>alert(1)</script>",
     "../../etc/passwd",
     "\x00\x01\x02"
   ];
   
   for (const input of maliciousInputs) {
     const res = await fetch(BASE_URL, {
       method: "POST",
       body: JSON.stringify({ event: "test", data: { payload: input } }),
       headers: { "Content-Type": "application/json" }
     });
     // Should return 200 or 202 because data is just a record, as long as it's valid JSON
     // The validation happens at the schema level and DB level (RLS/escaping)
     const status = res.status;
     assertEquals(status === 200 || status === 202 || status === 401, true);
   }
 });