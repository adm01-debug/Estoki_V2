import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

interface EnrollmentData {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export function useMFA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);

  const listFactors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      const allFactors = [...(data.totp || []), ...(data.phone || [])];
      setFactors(allFactors as MFAFactor[]);
      return allFactors;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error listing MFA factors:', err);
      setError((err instanceof Error ? err.message : String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getVerifiedFactors = useCallback(async () => {
    const allFactors = await listFactors();
    return allFactors.filter((f: MFAFactor) => f.status === 'verified');
  }, [listFactors]);

  const startEnrollment = useCallback(async (friendlyName?: string) => {
    setLoading(true);
    setError(null);
    setEnrollmentData(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName || 'Estoki Authenticator'
      });
      
      if (error) throw error;
      
      const enrollment: EnrollmentData = {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri
      };
      
      setEnrollmentData(enrollment);
      return enrollment;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error starting MFA enrollment:', err);
      setError((err instanceof Error ? err.message : String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEnrollment = useCallback(async (factorId: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });
      
      if (challengeError) throw challengeError;

      // Verify the code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });
      
      if (error) throw error;
      
      setEnrollmentData(null);
      await listFactors();
      return true;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error verifying MFA enrollment:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Código inválido. Verifique e tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [listFactors]);

  const verifyLogin = useCallback(async (factorId: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });
      
      if (challengeError) throw challengeError;

      // Verify the code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });
      
      if (error) throw error;
      
      return { success: true, session: data };
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error verifying MFA login:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Código inválido');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const unenroll = useCallback(async (factorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) throw error;
      
      await listFactors();
      return true;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error unenrolling MFA:', err);
      setError((err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [listFactors]);

  const cancelEnrollment = useCallback(async () => {
    if (enrollmentData?.factorId) {
      // Try to unenroll the unverified factor
      try {
        await supabase.auth.mfa.unenroll({ factorId: enrollmentData.factorId });
      } catch (err) {
        // Ignore errors - the factor might not exist or already be removed
      }
    }
    setEnrollmentData(null);
    setError(null);
  }, [enrollmentData]);

  const getAssuranceLevel = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      return data;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Error getting assurance level:', err);
      return null;
    }
  }, []);

  const isMFAEnabled = useCallback(async () => {
    const verifiedFactors = await getVerifiedFactors();
    return verifiedFactors.length > 0;
  }, [getVerifiedFactors]);

  const needsMFAVerification = useCallback(async () => {
    const assurance = await getAssuranceLevel();
    if (!assurance) return false;
    
    // User has MFA enabled but hasn't verified this session
    return assurance.currentLevel === 'aal1' && assurance.nextLevel === 'aal2';
  }, [getAssuranceLevel]);

  return {
    loading,
    error,
    factors,
    enrollmentData,
    listFactors,
    getVerifiedFactors,
    startEnrollment,
    verifyEnrollment,
    verifyLogin,
    unenroll,
    cancelEnrollment,
    getAssuranceLevel,
    isMFAEnabled,
    needsMFAVerification,
    clearError: () => setError(null)
  };
}
