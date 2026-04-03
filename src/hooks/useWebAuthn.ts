import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PasskeyCredential {
  id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

// Convert base64url to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Convert ArrayBuffer to base64url
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function useWebAuthn() {
  const [loading, setLoading] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  // Check if WebAuthn is supported
  const checkSupport = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);
      return available;
    } catch {
      setIsSupported(false);
      return false;
    }
  }, []);

  // Fetch user's passkeys
  const fetchPasskeys = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('passkey_credentials')
        .select('id, device_name, created_at, last_used_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasskeys(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching passkeys:', error);
      return [];
    }
  }, []);

  // Register a new passkey
  const registerPasskey = useCallback(async (deviceName?: string) => {
    setLoading(true);
    try {
      const supported = await checkSupport();
      if (!supported) {
        throw new Error('Seu dispositivo não suporta autenticação biométrica');
      }

      // Get registration options from server
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Você precisa estar logado para registrar uma passkey');
      }

      const optionsResponse = await supabase.functions.invoke('webauthn-register-options', {
        body: { deviceName: deviceName || 'Dispositivo' },
      });

      if (optionsResponse.error) {
        throw new Error(optionsResponse.error.message);
      }

      const { options } = optionsResponse.data;

      // Convert challenge and user.id to ArrayBuffer
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred: { id: string; type: string; transports?: string[] }) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha ao criar credencial');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Prepare credential for server
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          attestationObject: bufferToBase64url(response.attestationObject),
          publicKey: credential.id,
          transports: response.getTransports?.() || ['internal'],
        },
      };

      // Verify registration on server
      const verifyResponse = await supabase.functions.invoke('webauthn-register-verify', {
        body: { credential: credentialData, deviceName: deviceName || 'Dispositivo' },
      });

      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message);
      }

      toast.success('Passkey registrada com sucesso!');
      await fetchPasskeys();
      return true;
    } catch (error) {
      console.error('Error registering passkey:', error);
      const message = error instanceof Error ? error.message : 'Erro ao registrar passkey';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkSupport, fetchPasskeys]);

  // Authenticate with passkey
  const authenticateWithPasskey = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const supported = await checkSupport();
      if (!supported) {
        throw new Error('Seu dispositivo não suporta autenticação biométrica');
      }

      // Get authentication options from server
      const optionsResponse = await supabase.functions.invoke('webauthn-auth-options', {
        body: { email },
      });

      if (optionsResponse.error) {
        throw new Error(optionsResponse.error.message || 'Erro ao obter opções de autenticação');
      }

      const { options, challengeId, userId } = optionsResponse.data;

      if (!options || !challengeId || !userId) {
        throw new Error('Resposta inválida do servidor');
      }

      // Convert challenge and allowCredentials to ArrayBuffer
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: { id: string; type: string; transports?: string[] }) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
      };

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Autenticação cancelada');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Prepare credential for server
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          authenticatorData: bufferToBase64url(response.authenticatorData),
          signature: bufferToBase64url(response.signature),
          userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
        },
      };

      // Verify authentication on server
      const verifyResponse = await supabase.functions.invoke('webauthn-auth-verify', {
        body: { credential: credentialData, challengeId, userId },
      });

      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message || 'Erro ao verificar autenticação');
      }

      if (!verifyResponse.data.success) {
        throw new Error('Autenticação falhou');
      }

      toast.success('Login realizado com sucesso!');
      return verifyResponse.data;
    } catch (error) {
      console.error('Error authenticating with passkey:', error);
      const message = error instanceof Error ? error.message : 'Erro ao autenticar';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkSupport]);

  // Delete a passkey
  const deletePasskey = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('passkey_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Passkey removida com sucesso');
      await fetchPasskeys();
      return true;
    } catch (error) {
      console.error('Error deleting passkey:', error);
      toast.error('Erro ao remover passkey');
      return false;
    }
  }, [fetchPasskeys]);

  return {
    loading,
    passkeys,
    isSupported,
    checkSupport,
    fetchPasskeys,
    registerPasskey,
    authenticateWithPasskey,
    deletePasskey,
  };
}
