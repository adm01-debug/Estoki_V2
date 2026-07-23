/**
 * Exemplo de plugin — mostra o SDK em uso. NÃO é registrado automaticamente.
 */
import { definePlugin } from "./sdk";

export default definePlugin({
  id: "com.estoki.exemplo-eco",
  name: "Eco de Eventos",
  version: "0.1.0",
  minHostVersion: "1.0.0",
  description: "Loga cada evento de domínio recebido — útil para debug.",
  author: "ESTOKI Team",
  permissions: ["read:estoque"],
  on: {
    "lote.recebido": (evt, ctx) => {
      ctx.log("info", "[eco] lote recebido", { loteId: evt.payload.loteId });
    },
    "picking.confirmado": (evt, ctx) => {
      ctx.log("info", "[eco] picking confirmado", { pickingId: evt.payload.pickingId });
    },
  },
});