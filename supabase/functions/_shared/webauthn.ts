// Verificação criptográfica WebAuthn (W3C Level 2) usando @simplewebauthn/server.
//
// Antes deste módulo: webauthn-register-verify gravava public_key = credential.id (lixo, o
// navegador nunca devolve response.publicKey) e webauthn-auth-verify respondia 503 bloqueado,
// então a feature de passkey nunca funcionou em nenhum ambiente. Toda a criptografia fica aqui
// para ser testada sem navegador (ver webauthn_test.ts).

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "https://esm.sh/@simplewebauthn/server@13.1.2";
import { isoBase64URL } from "https://esm.sh/@simplewebauthn/server@13.1.2/helpers";

export const RP_NAME = "Estoki WMS";

/** Origem(ns) aceita(s). Padrão: o Origin da própria requisição. */
export interface RpConfig {
  rpId: string;
  expectedOrigin: string | string[];
}

function csv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Resolve rpId/origem esperados.
 * WEBAUTHN_ORIGINS (opcional): lista separada por vírgula, ex. "https://estoki-v2.vercel.app".
 * WEBAUTHN_RP_ID (opcional): deve ser o domínio registrável (ex. "estoki-v2.vercel.app").
 */
export function resolveRp(req: Request): RpConfig {
  const headerOrigin = (req.headers.get("origin") ?? "").trim();
  const fromEnv = csv(Deno.env.get("WEBAUTHN_ORIGINS"));
  const allowed = fromEnv.length ? fromEnv : headerOrigin ? [headerOrigin] : [];

  if (!allowed.length) {
    throw new Error("Origin ausente na requisicao");
  }

  for (const origin of allowed) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`WEBAUTHN_ORIGINS invalido: ${origin}`);
    }
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
      throw new Error(`Origem nao suportada: ${origin}`);
    }
  }

  const rpIdEnv = (Deno.env.get("WEBAUTHN_RP_ID") ?? "").trim();
  const rpId = rpIdEnv || new URL(allowed[0]).hostname;

  return { rpId, expectedOrigin: allowed.length === 1 ? allowed[0] : allowed };
}

export function base64urlEncode(bytes: Uint8Array): string {
  return isoBase64URL.fromBuffer(bytes);
}

export function base64urlDecode(value: string): Uint8Array {
  return isoBase64URL.toBuffer(value);
}

/** Uma chave COSE válida (P-256/EC2 ou RSA) tem pelo menos 60 bytes; credential.id tem ~32. */
export function isStoredPublicKeyUsable(publicKey: string | null | undefined): boolean {
  if (!publicKey) return false;
  try {
    return base64urlDecode(publicKey).byteLength >= 60;
  } catch {
    return false;
  }
}

export interface RegistrationOptionsInput {
  userId: string;
  userEmail: string | null;
  rpId: string;
  excludeCredentials: { id: string; transports?: string[] }[];
}

export async function buildRegistrationOptions(input: RegistrationOptionsInput) {
  return await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: input.rpId,
    userName: input.userEmail ?? input.userId,
    userDisplayName: input.userEmail?.split("@")[0] ?? "Usuario",
    userID: new TextEncoder().encode(input.userId),
    excludeCredentials: input.excludeCredentials.map((cred) => ({
      id: cred.id,
      transports: (cred.transports ?? ["internal"]) as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257],
  });
}

export interface AuthenticationOptionsInput {
  rpId: string;
  allowCredentials: { id: string; transports?: string[] }[];
}

export async function buildAuthenticationOptions(input: AuthenticationOptionsInput) {
  return await generateAuthenticationOptions({
    rpID: input.rpId,
    allowCredentials: input.allowCredentials.map((cred) => ({
      id: cred.id,
      transports: (cred.transports ?? ["internal"]) as AuthenticatorTransportFuture[],
    })),
    userVerification: "preferred",
  });
}

export interface VerifiedRegistration {
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
}

/** Valida o attestationObject/clientDataJSON e devolve a chave pública COSE em base64url. */
export async function verifyRegistrationCredential(params: {
  credential: unknown;
  expectedChallenge: string;
  expectedOrigin: string | string[];
  rpId: string;
}): Promise<VerifiedRegistration> {
  const verification = await verifyRegistrationResponse({
    // deno-lint-ignore no-explicit-any
    response: params.credential as any,
    expectedChallenge: params.expectedChallenge,
    expectedOrigin: params.expectedOrigin,
    expectedRPID: params.rpId,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registro de passkey nao verificado");
  }

  const { credential } = verification.registrationInfo;

  return {
    credentialId: credential.id,
    publicKey: base64urlEncode(credential.publicKey),
    counter: credential.counter,
    transports: (credential.transports ?? ["internal"]) as string[],
  };
}

export interface VerifiedAuthentication {
  newCounter: number;
  userVerified: boolean;
}

/** Valida a assinatura da assertion (authData || SHA256(clientDataJSON)) contra a chave salva. */
export async function verifyAuthenticationCredential(params: {
  credential: unknown;
  expectedChallenge: string;
  expectedOrigin: string | string[];
  rpId: string;
  storedCredentialId: string;
  storedPublicKey: string;
  storedCounter: number;
}): Promise<VerifiedAuthentication> {
  if (!isStoredPublicKeyUsable(params.storedPublicKey)) {
    throw new Error("Passkey salva em formato antigo e invalido; registre a passkey novamente");
  }

  const verification = await verifyAuthenticationResponse({
    // deno-lint-ignore no-explicit-any
    response: params.credential as any,
    expectedChallenge: params.expectedChallenge,
    expectedOrigin: params.expectedOrigin,
    expectedRPID: params.rpId,
    credential: {
      id: params.storedCredentialId,
      publicKey: base64urlDecode(params.storedPublicKey),
      counter: params.storedCounter,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    throw new Error("Assinatura da passkey invalida");
  }

  return {
    newCounter: verification.authenticationInfo.newCounter,
    userVerified: verification.authenticationInfo.userVerified,
  };
}

// Tipo mínimo para não depender do lib.dom na compilação das funções.
type AuthenticatorTransportFuture =
  | "ble"
  | "cable"
  | "hybrid"
  | "internal"
  | "nfc"
  | "smart-card"
  | "usb";