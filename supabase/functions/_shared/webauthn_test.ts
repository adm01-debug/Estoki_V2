// Prova sem navegador de que a verificação WebAuthn funciona: gera um par ES256 real, fabrica
// attestationObject/authData/clientDataJSON como o autenticador faria e exige que a verificação
// aceite o caso válido e rejeite challenge, origin, assinatura e contador inválidos.

import { assert, assertEquals, assertRejects, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isoCBOR } from "https://esm.sh/@simplewebauthn/server@13.1.2/helpers";
import {
  base64urlDecode,
  base64urlEncode,
  isStoredPublicKeyUsable,
  resolveRp,
  verifyAuthenticationCredential,
  verifyRegistrationCredential,
} from "./webauthn.ts";

const RP_ID = "estoki.test";
const ORIGIN = "https://estoki.test";
const CREDENTIAL_ID = crypto.getRandomValues(new Uint8Array(32));

const enc = new TextEncoder();

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return new Uint8Array(digest);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

function u32(value: number): Uint8Array {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

interface EcKeyPair {
  privateKey: CryptoKey;
  coseKey: Uint8Array;
}

async function createEcKeyPair(): Promise<EcKeyPair> {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const x = base64urlDecode(jwk.x!);
  const y = base64urlDecode(jwk.y!);

  const coseKey = isoCBOR.encode(
    // deno-lint-ignore no-explicit-any
    new Map<number, any>([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, x],
      [-3, y],
    ])
  );

  return { privateKey: pair.privateKey, coseKey };
}

async function makeAuthData(options: {
  rpId: string;
  flags: number;
  counter: number;
  attestedCredential?: { id: Uint8Array; coseKey: Uint8Array };
}): Promise<Uint8Array> {
  const parts: Uint8Array[] = [await sha256(enc.encode(options.rpId)), new Uint8Array([options.flags]), u32(options.counter)];
  if (options.attestedCredential) {
    parts.push(new Uint8Array(16)); // aaguid zerado
    parts.push(new Uint8Array([(options.attestedCredential.id.byteLength >> 8) & 255, options.attestedCredential.id.byteLength & 255]));
    parts.push(options.attestedCredential.id);
    parts.push(options.attestedCredential.coseKey);
  }
  return concat(parts);
}

function clientDataJSON(type: string, challenge: string, origin = ORIGIN): Uint8Array {
  return enc.encode(JSON.stringify({ type, challenge, origin, crossOrigin: false }));
}

function registrationCredential(options: {
  challenge: string;
  authData: Uint8Array;
  origin?: string;
}): Record<string, unknown> {
  const attestationObject = isoCBOR.encode(
    // deno-lint-ignore no-explicit-any
    new Map<string, any>([
      ["fmt", "none"],
      ["attStmt", new Map<string, unknown>()],
      ["authData", options.authData],
    ])
  );

  return {
    id: base64urlEncode(CREDENTIAL_ID),
    rawId: base64urlEncode(CREDENTIAL_ID),
    type: "public-key",
    clientExtensionResults: {},
    response: {
      clientDataJSON: base64urlEncode(clientDataJSON("webauthn.create", options.challenge, options.origin)),
      attestationObject: base64urlEncode(attestationObject),
      transports: ["internal"],
    },
  };
}

function authenticationCredential(options: {
  challenge: string;
  authData: Uint8Array;
  signature: Uint8Array;
  origin?: string;
}): Record<string, unknown> {
  return {
    id: base64urlEncode(CREDENTIAL_ID),
    rawId: base64urlEncode(CREDENTIAL_ID),
    type: "public-key",
    clientExtensionResults: {},
    response: {
      clientDataJSON: base64urlEncode(clientDataJSON("webauthn.get", options.challenge, options.origin)),
      authenticatorData: base64urlEncode(options.authData),
      signature: base64urlEncode(options.signature),
      userHandle: null,
    },
  };
}

async function sign(privateKey: CryptoKey, authData: Uint8Array, clientData: Uint8Array): Promise<Uint8Array> {
  const signedData = concat([authData, await sha256(clientData)]);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    signedData as unknown as ArrayBuffer
  );
  // WebCrypto devolve r||s; a especificação WebAuthn exige DER no campo signature.
  return rawEcdsaToDer(new Uint8Array(signature));
}

function trimInteger(bytes: Uint8Array): Uint8Array {
  let start = 0;
  while (start < bytes.length - 1 && bytes[start] === 0) start++;
  const trimmed = bytes.slice(start);
  return trimmed[0] & 0x80 ? concat([new Uint8Array([0]), trimmed]) : trimmed;
}

function rawEcdsaToDer(raw: Uint8Array): Uint8Array {
  const half = raw.byteLength / 2;
  const r = trimInteger(raw.slice(0, half));
  const s = trimInteger(raw.slice(half));
  const content = concat([
    new Uint8Array([0x02, r.byteLength]),
    r,
    new Uint8Array([0x02, s.byteLength]),
    s,
  ]);
  return concat([new Uint8Array([0x30, content.byteLength]), content]);
}

/** Executa o registro feliz e devolve a chave pública COSE já em base64url. */
async function registerPasskey(): Promise<{ publicKey: string; counter: number }> {
  const keys = await createEcKeyPair();
  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });

  const verified = await verifyRegistrationCredential({
    credential: registrationCredential({ challenge, authData }),
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    rpId: RP_ID,
  });

  assertEquals(verified.credentialId, base64urlEncode(CREDENTIAL_ID));
  assert(isStoredPublicKeyUsable(verified.publicKey), "public_key precisa ser COSE valido");

  return { publicKey: verified.publicKey, counter: verified.counter };
}

Deno.test("registro: aceita attestation none assinado por ES256", async () => {
  const { publicKey } = await registerPasskey();
  assert(publicKey.length > 80);
});

Deno.test("registro: rejeita challenge diferente do salvo", async () => {
  const keys = await createEcKeyPair();
  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });

  await assertRejects(() =>
    verifyRegistrationCredential({
      credential: registrationCredential({ challenge, authData }),
      expectedChallenge: base64urlEncode(crypto.getRandomValues(new Uint8Array(32))),
      expectedOrigin: ORIGIN,
      rpId: RP_ID,
    })
  );
});

Deno.test("registro: rejeita origin nao autorizada", async () => {
  const keys = await createEcKeyPair();
  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });

  await assertRejects(() =>
    verifyRegistrationCredential({
      credential: registrationCredential({ challenge, authData }),
      expectedChallenge: challenge,
      expectedOrigin: "https://atacante.test",
      rpId: RP_ID,
    })
  );
});

Deno.test("registro: rejeita authenticatorData de outro rpId", async () => {
  const keys = await createEcKeyPair();
  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({
    rpId: "atacante.test",
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });

  await assertRejects(() =>
    verifyRegistrationCredential({
      credential: registrationCredential({ challenge, authData }),
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      rpId: RP_ID,
    })
  );
});

Deno.test("autenticacao: aceita assinatura valida e devolve o novo contador", async () => {
  const { publicKey, counter } = await registerPasskey();
  const keys = await createEcKeyPair();

  // registra de verdade a chave usada na asserção
  const realChallenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const realAuthData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });
  await verifyRegistrationCredential({
    credential: registrationCredential({ challenge: realChallenge, authData: realAuthData }),
    expectedChallenge: realChallenge,
    expectedOrigin: ORIGIN,
    rpId: RP_ID,
  });
  const storedPublicKey = base64urlEncode(keys.coseKey);

  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({ rpId: RP_ID, flags: 0x05, counter: 1 });
  const signature = await sign(keys.privateKey, authData, clientDataJSON("webauthn.get", challenge));

  const verified = await verifyAuthenticationCredential({
    credential: authenticationCredential({ challenge, authData, signature }),
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    rpId: RP_ID,
    storedCredentialId: base64urlEncode(CREDENTIAL_ID),
    storedPublicKey,
    storedCounter: 0,
  });

  assertEquals(verified.newCounter, 1);
  assertEquals(verified.userVerified, true);
  // garante que o caminho "registro devolve chave utilizavel" também vale
  assert(isStoredPublicKeyUsable(publicKey));
  assertEquals(counter, 0);
});

Deno.test("autenticacao: rejeita assinatura adulterada", async () => {
  const keys = await createEcKeyPair();
  const regChallenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const regAuthData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });
  await verifyRegistrationCredential({
    credential: registrationCredential({ challenge: regChallenge, authData: regAuthData }),
    expectedChallenge: regChallenge,
    expectedOrigin: ORIGIN,
    rpId: RP_ID,
  });

  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({ rpId: RP_ID, flags: 0x05, counter: 1 });
  const signature = await sign(keys.privateKey, authData, clientDataJSON("webauthn.get", challenge));
  const tampered = new Uint8Array(signature);
  tampered[0] = tampered[0] ^ 0xff;

  await assertRejects(() =>
    verifyAuthenticationCredential({
      credential: authenticationCredential({ challenge, authData, signature: tampered }),
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      rpId: RP_ID,
      storedCredentialId: base64urlEncode(CREDENTIAL_ID),
      storedPublicKey: base64urlEncode(keys.coseKey),
      storedCounter: 0,
    })
  );
});

Deno.test("autenticacao: rejeita contador que nao avancou (replay)", async () => {
  const keys = await createEcKeyPair();
  const regChallenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const regAuthData = await makeAuthData({
    rpId: RP_ID,
    flags: 0x41,
    counter: 0,
    attestedCredential: { id: CREDENTIAL_ID, coseKey: keys.coseKey },
  });
  await verifyRegistrationCredential({
    credential: registrationCredential({ challenge: regChallenge, authData: regAuthData }),
    expectedChallenge: regChallenge,
    expectedOrigin: ORIGIN,
    rpId: RP_ID,
  });

  const challenge = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const authData = await makeAuthData({ rpId: RP_ID, flags: 0x05, counter: 3 });
  const signature = await sign(keys.privateKey, authData, clientDataJSON("webauthn.get", challenge));

  await assertRejects(() =>
    verifyAuthenticationCredential({
      credential: authenticationCredential({ challenge, authData, signature }),
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      rpId: RP_ID,
      storedCredentialId: base64urlEncode(CREDENTIAL_ID),
      storedPublicKey: base64urlEncode(keys.coseKey),
      storedCounter: 3,
    })
  );
});

Deno.test("autenticacao: rejeita public_key gravada no formato antigo (credential.id)", async () => {
  await assertRejects(() =>
    verifyAuthenticationCredential({
      credential: { id: "x" },
      expectedChallenge: "x",
      expectedOrigin: ORIGIN,
      rpId: RP_ID,
      storedCredentialId: base64urlEncode(CREDENTIAL_ID),
      storedPublicKey: base64urlEncode(CREDENTIAL_ID),
      storedCounter: 0,
    })
  );
});


// --- resolveRp: a origem tem de estar numa allowlist fixa, nunca no header do cliente ---

function comWebauthnOrigins(valor: string | null): void {
  if (valor === null) Deno.env.delete("WEBAUTHN_ORIGINS");
  else Deno.env.set("WEBAUTHN_ORIGINS", valor);
}

function comRpId(valor: string | null): void {
  if (valor === null) Deno.env.delete("WEBAUTHN_RP_ID");
  else Deno.env.set("WEBAUTHN_RP_ID", valor);
}

function pedidoComOrigem(origin?: string): Request {
  return new Request("https://edge.test/functions/v1/webauthn-auth-options", origin
    ? { headers: { origin } }
    : {});
}

Deno.test("resolveRp: sem WEBAUTHN_ORIGINS falha fechado", () => {
  comWebauthnOrigins(null);
  comRpId(null);
  assertThrows(
    () => resolveRp(pedidoComOrigem("https://atacante.test")),
    Error,
    "WEBAUTHN_ORIGINS nao configurado",
  );
});

Deno.test("resolveRp: origem fora da allowlist e recusada", () => {
  comWebauthnOrigins("https://estoki.app");
  try {
    assertThrows(
      () => resolveRp(pedidoComOrigem("https://atacante.test")),
      Error,
      "Origem nao permitida",
    );
  } finally {
    comWebauthnOrigins(null);
  }
});

Deno.test("resolveRp: origem ausente e recusada", () => {
  comWebauthnOrigins("https://estoki.app");
  try {
    assertThrows(() => resolveRp(pedidoComOrigem()), Error, "Origem nao permitida");
  } finally {
    comWebauthnOrigins(null);
  }
});

Deno.test("resolveRp: origem permitida vira rpId e expectedOrigin exatos", () => {
  comWebauthnOrigins("https://estoki.app,https://estoki-v2.vercel.app");
  comRpId(null);
  try {
    const config = resolveRp(pedidoComOrigem("https://estoki-v2.vercel.app"));
    assertEquals(config.rpId, "estoki-v2.vercel.app");
    assertEquals(config.expectedOrigin, "https://estoki-v2.vercel.app");
  } finally {
    comWebauthnOrigins(null);
  }
});

Deno.test("resolveRp: WEBAUTHN_RP_ID fixo tem precedencia sobre o hostname", () => {
  comWebauthnOrigins("https://estoki.app");
  comRpId("estoki.app");
  try {
    assertEquals(resolveRp(pedidoComOrigem("https://estoki.app")).rpId, "estoki.app");
  } finally {
    comWebauthnOrigins(null);
    comRpId(null);
  }
});

Deno.test("resolveRp: entrada com caminho e recusada", () => {
  comWebauthnOrigins("https://estoki.app/entrar");
  try {
    assertThrows(() => resolveRp(pedidoComOrigem("https://estoki.app")), Error, "sem caminho");
  } finally {
    comWebauthnOrigins(null);
  }
});
