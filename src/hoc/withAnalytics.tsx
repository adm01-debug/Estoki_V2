import React, { ComponentType, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface WithAnalyticsOptions {
  trackPageView?: boolean;
  trackEvents?: boolean;
  componentName?: string;
}

export function withAnalytics<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAnalyticsOptions = {}
) {
  const { 
    trackPageView = true, 
    trackEvents = true,
    componentName 
  } = options;

  const WithAnalyticsComponent: React.FC<P> = (props) => {
    const location = useLocation();
    const { trackPage, trackEvent } = useAnalytics();

    useEffect(() => {
      if (trackPageView) {
        trackPage({
          path: location.pathname,
          title: document.title,
          component: componentName || WrappedComponent.displayName || WrappedComponent.name,
        });
      }
    }, [location.pathname, trackPage]);

    useEffect(() => {
      if (trackEvents) {
        trackEvent({
          category: 'Component',
          action: 'Mount',
          label: componentName || WrappedComponent.displayName || WrappedComponent.name,
        });

        return () => {
          trackEvent({
            category: 'Component',
            action: 'Unmount',
            label: componentName || WrappedComponent.displayName || WrappedComponent.name,
          });
        };
      }
    }, [trackEvent]);

    return <WrappedComponent {...props} />;
  };

  WithAnalyticsComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAnalyticsComponent;
}

export default withAnalytics;
