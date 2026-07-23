/**
 * Cliente Correios API v3 (autentica + preco + srorastro + prepostagem).
 *
 * Usa secrets:
 *   - CORREIOS_USER     (código do contrato / usuário API)
 *   - CORREIOS_TOKEN    (token gerado no portal Meu Correios)
 *   - CORREIOS_CONTRATO (nº do contrato, opcional para preço)
 *   - CORREIOS_CARTAO   (nº do cartão de postagem, obrigatório p/ prepostagem)
 *
 * Se `CORREIOS_USER`/`CORREIOS_TOKEN` estiverem ausentes o cliente lança
 * `MissingCredentialsError` — chamadores devem cair em modo simulação.
 *
 * Token bearer é cacheado em memória do isolate (Correios devolve ~24h de TTL).
 */

const BASE_URL = "https://api.correios.com.br";

export class MissingCredentialsError extends Error {
  constructor() {
    super("CORREIOS_USER/CORREIOS_TOKEN não configurados");
    this.name = "MissingCredentialsError";
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchToken(): Promise<string> {
  const user = Deno.env.get("CORREIOS_USER");
  const token = Deno.env.get("CORREIOS_TOKEN");
  if (!user || !token) throw new MissingCredentialsError();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const basic = btoa(`${user}:${token}`);
  const body: Record<string, string> = {};
  const contrato = Deno.env.get("CORREIOS_CONTRATO");
  if (contrato) body["numero"] = contrato;

  const url = contrato
    ? `${BASE_URL}/token/v1/autentica/contrato`
    : `${BASE_URL}/token/v1/autentica`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: contrato ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Correios auth falhou (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const bearer = data.token as string;
  const expiraEm = data.expiraEm ? new Date(data.expiraEm).getTime() : Date.now() + 8 * 3600_000;
  cachedToken = { token: bearer, expiresAt: expiraEm };
  return bearer;
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const bearer = await fetchToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${bearer}`);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Se token expirou, invalida cache e tenta uma vez mais.
  if (res.status === 401) {
    cachedToken = null;
    const bearer2 = await fetchToken();
    headers.set("Authorization", `Bearer ${bearer2}`);
    return fetch(`${BASE_URL}${path}`, { ...init, headers });
  }

  return res;
}

export interface QuoteRequest {
  originZip: string;
  destZip: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  services: string[]; // ["04014","04510"]
}

export interface QuoteResult {
  code: string;
  service: string;
  price: number;
  delivery_days: number;
  delivery_date: string;
  carrier: "Correios";
}

const SERVICE_NAMES: Record<string, string> = {
  "04014": "SEDEX",
  "04510": "PAC",
  "03220": "SEDEX Contrato",
  "03298": "PAC Contrato",
};

export async function quote(request: QuoteRequest): Promise<QuoteResult[]> {
  const cepOrigem = request.originZip.replace(/\D/g, "");
  const cepDestino = request.destZip.replace(/\D/g, "");
  const psObjeto = Math.max(0.1, request.weightKg).toFixed(3);

  const bodyPreco = {
    idLote: crypto.randomUUID(),
    parametrosProduto: request.services.map((codigo) => ({
      coProduto: codigo,
      cepOrigem,
      cepDestino,
      psObjeto,
      tpObjeto: "2",
      comprimento: String(request.lengthCm),
      largura: String(request.widthCm),
      altura: String(request.heightCm),
    })),
  };

  const [precoRes, prazoRes] = await Promise.all([
    authedFetch("/preco/v1/nacional", { method: "POST", body: JSON.stringify(bodyPreco) }),
    authedFetch("/prazo/v1/nacional", { method: "POST", body: JSON.stringify(bodyPreco) }),
  ]);

  if (!precoRes.ok) throw new Error(`Correios preço ${precoRes.status}`);
  if (!prazoRes.ok) throw new Error(`Correios prazo ${prazoRes.status}`);

  const precos = (await precoRes.json()) as Array<{ coProduto: string; pcFinal: string; txErro?: string; msgErro?: string }>;
  const prazos = (await prazoRes.json()) as Array<{ coProduto: string; prazoEntrega: number; dataMaxima?: string }>;

  const prazoByCode = new Map(prazos.map((p) => [p.coProduto, p]));

  return precos
    .filter((p) => !p.txErro)
    .map((p) => {
      const prazo = prazoByCode.get(p.coProduto);
      const days = prazo?.prazoEntrega ?? 10;
      return {
        code: p.coProduto,
        service: SERVICE_NAMES[p.coProduto] ?? p.coProduto,
        price: Number(String(p.pcFinal).replace(",", ".")),
        delivery_days: days,
        delivery_date:
          prazo?.dataMaxima ??
          new Date(Date.now() + days * 86400_000).toISOString().slice(0, 10),
        carrier: "Correios" as const,
      };
    });
}

export interface TrackEvent {
  date: string;
  status: string;
  description: string;
  location: string;
}

export async function track(trackingCode: string): Promise<TrackEvent[]> {
  const code = trackingCode.trim().toUpperCase();
  const res = await authedFetch(`/srorastro/v1/objetos/${code}?resultado=T`);
  if (!res.ok) throw new Error(`Correios rastreio ${res.status}`);
  const data = (await res.json()) as {
    objetos?: Array<{
      codObjeto: string;
      eventos?: Array<{
        dtHrCriado: string;
        descricao: string;
        codigo?: string;
        tipo?: string;
        unidade?: { endereco?: { cidade?: string; uf?: string } };
      }>;
    }>;
  };
  const objeto = data.objetos?.[0];
  if (!objeto?.eventos) return [];
  return objeto.eventos.map((e) => ({
    date: e.dtHrCriado,
    status: e.codigo ?? e.tipo ?? "info",
    description: e.descricao,
    location: [e.unidade?.endereco?.cidade, e.unidade?.endereco?.uf]
      .filter(Boolean)
      .join(" - "),
  }));
}

export interface PrepostagemPayload {
  remetente: Record<string, unknown>;
  destinatario: Record<string, unknown>;
  servico: string; // "04014"
  volume: { peso: number; altura: number; largura: number; comprimento: number };
  observacao?: string;
  notaFiscal?: { chave?: string; numero?: string; serie?: string };
}

export interface PrepostagemResult {
  id: string;
  codigoObjeto: string;
  valor: string;
  prazo: number;
}

export async function prepostagem(payload: PrepostagemPayload): Promise<PrepostagemResult> {
  const cartao = Deno.env.get("CORREIOS_CARTAO");
  if (!cartao) throw new Error("CORREIOS_CARTAO não configurado (obrigatório para prepostagem)");

  const body = {
    idCorreios: cartao,
    codigoServico: payload.servico,
    numeroCartaoPostagem: cartao,
    remetente: payload.remetente,
    destinatario: payload.destinatario,
    servicoAdicional: [],
    observacao: payload.observacao ?? "",
    itensDeclaracaoConteudo: [],
    pesoInformado: String(Math.round(payload.volume.peso * 1000)),
    codigoFormatoObjetoInformado: "2",
    alturaInformada: String(payload.volume.altura),
    larguraInformada: String(payload.volume.largura),
    comprimentoInformado: String(payload.volume.comprimento),
    ...(payload.notaFiscal ? { notaFiscal: payload.notaFiscal } : {}),
  };

  const res = await authedFetch("/prepostagem/v2/prepostagens", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Correios prepostagem ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return {
    id: data.id ?? data.idPrePostagem ?? "",
    codigoObjeto: data.codigoObjeto ?? data.objeto ?? "",
    valor: data.precoPostagem ?? data.valor ?? "0",
    prazo: Number(data.prazoObjeto ?? data.prazo ?? 0),
  };
}

export function hasCredentials(): boolean {
  return !!(Deno.env.get("CORREIOS_USER") && Deno.env.get("CORREIOS_TOKEN"));
}

// exportado para testes
export function _resetTokenCache() {
  cachedToken = null;
}