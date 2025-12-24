import React, { ComponentType, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/spinner';

export interface WithLoadingOptions {
  LoadingComponent?: React.FC;
  minDelay?: number;
}

export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingOptions = {}
) {
  const { LoadingComponent } = options;

  const DefaultLoading = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  const WithLoadingComponent: React.FC<P> = (props) => {
    return (
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <DefaultLoading />}>
        <WrappedComponent {...props} />
      </Suspense>
    );
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithLoadingComponent;
}

export function withSkeleton<P extends object>(
  WrappedComponent: ComponentType<P & { isLoading?: boolean }>,
  SkeletonComponent: React.FC
) {
  const WithSkeletonComponent: React.FC<P & { isLoading?: boolean }> = (props) => {
    if (props.isLoading) {
      return <SkeletonComponent />;
    }
    return <WrappedComponent {...props} />;
  };

  WithSkeletonComponent.displayName = `withSkeleton(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithSkeletonComponent;
}

export default withLoading;
