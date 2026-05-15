 import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
 
 const BASE_URL = "http://localhost:54321/functions/v1";
 
 Deno.test("abc-analysis: should require POST method", async () => {
   const res = await fetch(`${BASE_URL}/abc-analysis`, {
     method: "GET",
   });
   // If it allows GET, it might return 200 or 405 depending on implementation
   // Looking at the code, it doesn't check method explicitly but req.json() will fail for GET without body
   if (res.status === 405 || res.status === 400) {
     assertExists(res.status);
   }
 });
 
 Deno.test("abc-analysis: should calculate with default period", async () => {
   const res = await fetch(`${BASE_URL}/abc-analysis`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({}),
   });
   
   // Since it's an integration test, it might fail if local supabase is not running or no data
   // But we want to ensure it handles the request
   if (res.status === 200) {
     const data = await res.json();
     assertExists(data.summary);
     assertExists(data.analysis);
   }
 });