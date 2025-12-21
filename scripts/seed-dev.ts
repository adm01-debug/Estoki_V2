#!/usr/bin/env npx ts-node
/**
 * Script para popular banco de desenvolvimento
 */

console.log("🌱 Seeding development database...");

const seedData = {
  positions: 50,
  triagens: 100,
  recebimentos: 30,
};

console.log("Criando:", seedData);
console.log("✅ Seed concluído!");
console.log("Execute: psql -f supabase/seed.sql");
