// Re-export all services
export * from "./posicaoService";
export * from "./triagemService";
export * from "./recebimentoService";

// Service factory for dependency injection
export function createServices() {
  return {
    // Add services here as they are created
  };
}
