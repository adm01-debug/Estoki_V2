import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PasswordResetRequest {
  id: string;
  user_id: string;
  user_email: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  motivo: string | null;
  observacao_admin: string | null;
  solicitado_em: string;
  aprovado_por: string | null;
  aprovado_em: string | null;
  expira_em: string;
}

export function usePasswordResetRequests() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .order('solicitado_em', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests((data || []) as PasswordResetRequest[]);
    }
    setLoading(false);
  };

  const fetchMyRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('solicitado_em', { ascending: false });
    
    if (error) {
      console.error('Error fetching my requests:', error);
    } else {
      setMyRequests((data || []) as PasswordResetRequest[]);
    }
  };

  useEffect(() => {
    fetchAllRequests();
    fetchMyRequests();
  }, []);

  const createRequest = async (motivo: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Check for pending requests
    const { data: existing } = await supabase
      .from('password_reset_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pendente')
      .single();

    if (existing) {
      toast.error('Você já possui uma solicitação pendente');
      return false;
    }

    const { error } = await supabase
      .from('password_reset_requests')
      .insert({
        user_id: user.id,
        user_email: user.email || '',
        motivo
      });

    if (error) {
      toast.error('Erro ao criar solicitação');
      return false;
    }

    toast.success('Solicitação enviada para aprovação');
    fetchMyRequests();
    return true;
  };

  const approveRequest = async (id: string, observacao?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'aprovado',
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
        observacao_admin: observacao
      })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao aprovar solicitação');
      return false;
    }

    // Get the request to send reset email
    const { data: request } = await supabase
      .from('password_reset_requests')
      .select('user_email')
      .eq('id', id)
      .single();

    if (request) {
      // Send password reset email via Supabase Auth
      await supabase.auth.resetPasswordForEmail(request.user_email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
    }

    toast.success('Solicitação aprovada. Email de reset enviado.');
    fetchAllRequests();
    return true;
  };

  const rejectRequest = async (id: string, observacao: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'rejeitado',
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
        observacao_admin: observacao
      })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao rejeitar solicitação');
      return false;
    }

    toast.success('Solicitação rejeitada');
    fetchAllRequests();
    return true;
  };

  const pendingCount = requests.filter(r => r.status === 'pendente').length;

  return {
    requests,
    myRequests,
    loading,
    createRequest,
    approveRequest,
    rejectRequest,
    pendingCount,
    refresh: () => {
      fetchAllRequests();
      fetchMyRequests();
    }
  };
}
