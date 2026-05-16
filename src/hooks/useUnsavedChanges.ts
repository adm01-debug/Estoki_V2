 import { useEffect } from 'react';
 import { useBlocker } from 'react-router-dom';
 
 export function useUnsavedChanges(hasChanges: boolean, message = "Você tem alterações não salvas. Tem certeza que deseja sair?") {
   // Handle browser refresh/close
   useEffect(() => {
     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       if (hasChanges) {
         e.preventDefault();
         e.returnValue = message;
         return message;
       }
     };
 
     window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
   }, [hasChanges, message]);
 
   // Handle client-side navigation
   const blocker = useBlocker(
     ({ currentLocation, nextLocation }) =>
       hasChanges && currentLocation.pathname !== nextLocation.pathname
   );
 
   return blocker;
 }