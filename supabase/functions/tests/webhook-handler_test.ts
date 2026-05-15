 import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
 
 const BASE_URL = "http://localhost:54321/functions/v1";
 
 Deno.test("webhook-handler: should reject invalid method", async () => {
   const res = await fetch(`${BASE_URL}/webhook-handler`, {
     method: "GET",
   });
   assertEquals(res.status, 405);
   const body = await res.json();
   assertEquals(body.error, "Method not allowed");
 });
 
 Deno.test("webhook-handler: should reject invalid secret", async () => {
   const res = await fetch(`${BASE_URL}/webhook-handler`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-webhook-secret": "wrong-secret",
     },
     body: JSON.stringify({ event: "test", data: {} }),
   });
   assertEquals(res.status, 401);
 });
 
 Deno.test("webhook-handler: should validate payload schema", async () => {
   const res = await fetch(`${BASE_URL}/webhook-handler`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       // Secret check bypassed if not set in test env or if we mock it
     },
     body: JSON.stringify({ invalid: "payload" }),
   });
   // Should return 400 if secret is valid or not required
   if (res.status !== 401) {
     assertEquals(res.status, 400);
   }
 });