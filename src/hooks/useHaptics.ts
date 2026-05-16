 import { useCallback } from 'react';
 import { haptics } from '@/utils/haptics';
 
 /**
  * Hook for unified haptic feedback
  */
 export function useHaptics() {
   const light = useCallback(() => haptics.light(), []);
   const medium = useCallback(() => haptics.medium(), []);
   const success = useCallback(() => haptics.success(), []);
   const error = useCallback(() => haptics.error(), []);
 
   return { light, medium, success, error };
 }