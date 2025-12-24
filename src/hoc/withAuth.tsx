import React, { ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/spinner';

export interface WithAuthOptions {
  redirectTo?: string;
  LoadingComponent?: React.FC;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/login', LoadingComponent } = options;

  const WithAuthComponent: React.FC<P> = (props) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}

export default withAuth;
