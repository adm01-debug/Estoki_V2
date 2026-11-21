import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type IntegrationKind = "sap" | "totvs" | "amazon" | "mercado-livre" | "ifood" | "rappi";

interface IntegrationDef {
  kind: IntegrationKind;
  name: string;
  fn: string;
  action: string;
  desc: string;
  urlLabel: string;
  credLabel: string;
  needsKey?: boolean;
  hasUrl?: boolean;
}

const INTEGRACOES: IntegrationDef[] = [
  {
    kind: "sap",
    name: "SAP Business One",
    fn: "integration-sap",
    action: "get_items",
    desc: "Service Layer (B1S) — itens e estoque",
    urlLabel: "Base URL do Service Layer",
    credLabel: "Sessão B1SESSION",
  },
  {
    kind: "totvs",
    name: "TOTVS Protheus",
    fn: "integration-totvs",
    action: "get_products",
    desc: "REST Protheus — produtos e estoque",
    urlLabel: "Base URL do REST Protheus",
    credLabel: "Token de acesso",
  },
  {
    kind: "amazon",
    name: "Amazon SP-API",
    fn: "integration-amazon",
    action: "list_catalog_items",
    desc: "Selling Partner API — itens",
    urlLabel: "Marketplace endpoint",
    credLabel: "Access token",
    needsKey: true,
    hasUrl: false,
  },
  {
    kind: "mercado-livre",
    name: "Mercado Livre",
    fn: "integration-mercado-livre",
    action: "list_items",
    desc: "Sincroniza produtos via ml_item_id",
    urlLabel: "Base URL da API",
    credLabel: "Access token",
    hasUrl: false,
  },
  {
    kind: "ifood",
    name: "iFood",
    fn: "integration-ifood",
    action: "get_orders",
    desc: "Pedidos e cardápio",
    urlLabel: "Base URL da API",
    credLabel: "Access token",
    hasUrl: false,
  },
  {
    kind: "rappi",
    name: "Rappi",
    fn: "integration-rappi",
    action: "get_orders",
    desc: "Pedidos e entregas",
    urlLabel: "Base URL da API",
    credLabel: "API key",
    hasUrl: false,
  },
];

export default function IntegrationsPage() {
  const [creds, setCreds] = useState<Record<string, { url: string; cred: string; key: string }>>(
    {}
  );
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; detail: string }>>({});

  const handleTest = async (def: IntegrationDef) => {
    const cfg = creds[def.kind] ?? { url: "", cred: "", key: "" };
    setTesting(def.kind);
    setResults((r) => ({ ...r, [def.kind]: { ok: true, detail: "Conectando…" } }));
    const body: Record<string, unknown> = {
      action: def.action,
      data: { limit: 1 },
    };
    if (def.hasUrl !== false) body.config = { base_url: cfg.url };
    // SAP/TOTVS: handler recebe config { base_url, credencial }.
    if (def.kind === "sap") body.config = { base_url: cfg.url, session_id: cfg.cred };
    if (def.kind === "totvs") body.config = { base_url: cfg.url, token: cfg.cred };
    // Marketplaces: handler recebe credentials (endpoint fixo na function).
    if (def.kind === "amazon") {
      body.credentials = { access_token: cfg.cred };
      body.marketplace_id = cfg.key;
    }
    if (def.kind === "mercado-livre" || def.kind === "ifood") {
      body.credentials = { access_token: cfg.cred };
    }
    if (def.kind === "rappi") body.credentials = { api_key: cfg.cred };

    try {
      const { data, error } = await supabase.functions.invoke(def.fn, { body });
      if (error) throw error;
      const d = (data ?? {}) as { success?: boolean; error?: string; data?: unknown; ok?: boolean };
      if (d.success === true || d.ok === true) {
        setResults((r) => ({
          ...r,
          [def.kind]: { ok: true, detail: "Conexão OK — integração respondeu." },
        }));
        toast({ title: `${def.name}`, description: "Integração funcional e respondendo." });
      } else {
        const msg = d.error ?? JSON.stringify(d);
        setResults((r) => ({
          ...r,
          [def.kind]: { ok: false, detail: `Integração respondeu mas retornou: ${msg}` },
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResults((r) => ({ ...r, [def.kind]: { ok: false, detail: msg } }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte o Estoki a ERPs (SAP / TOTVS) e marketplaces (Amazon, Mercado Livre, iFood,
          Rappi). Preencha os dados da API e clique em <strong>Testar conexão</strong>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {INTEGRACOES.map((def) => {
          const cfg = creds[def.kind] ?? { url: "", cred: "", key: "" };
          const res = results[def.kind];
          const busy = testing === def.kind;
          return (
            <Card key={def.kind}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{def.name}</CardTitle>
                  <Badge
                    variant={res?.ok === false ? "destructive" : res?.ok ? "default" : "secondary"}
                  >
                    {busy
                      ? "Testando…"
                      : res?.ok === false
                        ? "Falha"
                        : res?.ok
                          ? "Ativo"
                          : "Não testado"}
                  </Badge>
                </div>
                <CardDescription>{def.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {def.hasUrl !== false && (
                  <div className="space-y-1">
                    <Label htmlFor={`${def.kind}-url`}>{def.urlLabel}</Label>
                    <Input
                      id={`${def.kind}-url`}
                      placeholder="https://..."
                      value={cfg.url}
                      onChange={(e) =>
                        setCreds((c) => ({ ...c, [def.kind]: { ...cfg, url: e.target.value } }))
                      }
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor={`${def.kind}-cred`}>{def.credLabel}</Label>
                  <Input
                    id={`${def.kind}-cred`}
                    type="password"
                    placeholder="chave / token"
                    value={cfg.cred}
                    onChange={(e) =>
                      setCreds((c) => ({ ...c, [def.kind]: { ...cfg, cred: e.target.value } }))
                    }
                  />
                </div>
                {def.needsKey && (
                  <div className="space-y-1">
                    <Label htmlFor={`${def.kind}-key`}>Marketplace ID</Label>
                    <Input
                      id={`${def.kind}-key`}
                      placeholder="ex.: ATVPDKIKX0DER"
                      value={cfg.key}
                      onChange={(e) =>
                        setCreds((c) => ({ ...c, [def.kind]: { ...cfg, key: e.target.value } }))
                      }
                    />
                  </div>
                )}
                <Button disabled={busy} onClick={() => handleTest(def)}>
                  {busy ? "Testando…" : "Testar conexão"}
                </Button>
                {res && (
                  <p className={`text-sm ${res.ok ? "text-emerald-600" : "text-destructive"}`}>
                    {res.detail}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
