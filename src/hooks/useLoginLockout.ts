import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LockoutState {
  isLocked: boolean;
  lockedUntil: Date | null;
  attemptsCount: number;
  secondsRemaining: number;
}

export function useLoginLockout() {
  const [lockoutState, setLockoutState] = useState<LockoutState>({
    isLocked: false,
    lockedUntil: null,
    attemptsCount: 0,
    secondsRemaining: 0,
  });

  // Timer para contagem regressiva
  useEffect(() => {
    if (!lockoutState.isLocked || lockoutState.secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockoutState(prev => {
        const newSeconds = prev.secondsRemaining - 1;
        if (newSeconds <= 0) {
          return { ...prev, isLocked: false, secondsRemaining: 0, lockedUntil: null };
        }
        return { ...prev, secondsRemaining: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutState.isLocked, lockoutState.secondsRemaining]);

  const checkLockout = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('check_login_lockout', {
        p_email: email.toLowerCase().trim(),
      });

      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao verificar bloqueio:', error);
        return false;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setLockoutState({
          isLocked: result.is_locked,
          lockedUntil: result.locked_until ? new Date(result.locked_until) : null,
          attemptsCount: result.attempts_count,
          secondsRemaining: result.seconds_remaining,
        });
        return result.is_locked;
      }

      return false;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao verificar bloqueio:', err);
      return false;
    }
  }, []);

  const recordFailedAttempt = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('record_failed_login', {
        p_email: email.toLowerCase().trim(),
      });

      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao registrar tentativa:', error);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setLockoutState({
          isLocked: result.is_locked,
          lockedUntil: result.locked_until ? new Date(result.locked_until) : null,
          attemptsCount: result.attempts_count,
          secondsRemaining: result.seconds_remaining,
        });
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao registrar tentativa:', err);
    }
  }, []);

  const resetLockout = useCallback(async (email: string) => {
    try {
      await supabase.rpc('reset_login_attempts', {
        p_email: email.toLowerCase().trim(),
      });

      setLockoutState({
        isLocked: false,
        lockedUntil: null,
        attemptsCount: 0,
        secondsRemaining: 0,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao resetar bloqueio:', err);
    }
  }, []);

  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return '';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  return {
    ...lockoutState,
    checkLockout,
    recordFailedAttempt,
    resetLockout,
    formatTimeRemaining,
  };
}
