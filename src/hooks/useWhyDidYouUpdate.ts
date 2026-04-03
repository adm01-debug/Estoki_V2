import { useRef, useEffect } from 'react';
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>({});
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changes: Record<string, any> = {};
      allKeys.forEach(key => { if (previousProps.current[key] !== props[key]) changes[key] = { from: previousProps.current[key], to: props[key] }; });
      if (Object.keys(changes).length && import.meta.env.DEV) console.log('[why-did-you-update]', name, changes);
    }
    previousProps.current = props;
  });
}
