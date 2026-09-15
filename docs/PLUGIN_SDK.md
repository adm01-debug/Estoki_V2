# ESTOKI Plugin SDK (v0.1 — MVP)

Terceiros podem estender o ESTOKI WMS sem forkar o repositório.

## Escrever um plugin

```ts
import { definePlugin } from "@/plugins/sdk";

export default definePlugin({
  id: "com.acme.frete-extra",
  name: "Frete Extra",
  version: "1.0.0",
  minHostVersion: "1.0.0",
  permissions: ["read:estoque", "invoke:ai"],
  nav: [{ label: "Frete Extra", path: "/plugins/frete-extra" }],
  on: {
    "lote.recebido": async (evt, ctx) => {
      await ctx.invoke("carrier-quote-correios", { cep: "01310-100" });
      ctx.toast(`Cotação disparada para lote ${evt.payload.loteId}`);
    },
  },
});
```

## Superfícies

| Campo                         | Uso                                |
| ----------------------------- | ---------------------------------- |
| `nav`                         | Itens de menu no shell autenticado |
| `routes`                      | Rotas React montadas no shell      |
| `widgets`                     | Cards de dashboard                 |
| `on`                          | Handlers de eventos de domínio     |
| `onActivate` / `onDeactivate` | Ciclo de vida                      |

## Contrato de segurança

- Plugins nunca importam o cliente Supabase — usam `ctx.invoke()` / `ctx.query()`.
- Permissões declaradas em `permissions[]` são revisadas no ativar.
- `minHostVersion` é validado por `satisfiesMinVersion()` antes do registro.
- Handlers com exceção são isolados via `try/catch` e loggados; não derrubam o host.

## Eventos disponíveis

- `lote.recebido`
- `picking.confirmado`
- `estoque.ajustado`
- `xp.ganho`
