import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MFAVerify } from '@/components/MFAVerify';
import { useMFA } from '@/hooks/useMFA';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getVerifiedFactors } = useMFA();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const returnTo = (location.state as any)?.returnTo || '/dashboard';

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const factors = await getVerifiedFactors();
      if (factors.length > 0) {
        setFactorId(factors[0].id);
      } else {
        // No MFA factors, redirect to dashboard
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      console.error('Error checking MFA status:', err);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate(returnTo, { replace: true });
  };

  const handleCancel = () => {
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <MFAVerify 
        factorId={factorId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
