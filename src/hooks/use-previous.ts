import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

export function useWhyDidYouUpdate<T extends Record<string, any>>(name: string, props: T) {
  const previousProps = useRef<T>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changesObj[key] = { from: previousProps.current![key], to: props[key] };
        }
      });

      if (Object.keys(changesObj).length && import.meta.env.DEV) {
        console.log('[why-did-you-update]', name, changesObj);
      }
    }
    previousProps.current = props;
  });
}

export default usePrevious;
