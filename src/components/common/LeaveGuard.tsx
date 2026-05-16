 import { useEffect, useState } from 'react';
 import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
 import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
 
 interface LeaveGuardProps {
   hasChanges: boolean;
   title?: string;
   description?: string;
 }
 
 export function LeaveGuard({ 
   hasChanges, 
   title = "Sair sem salvar?", 
   description = "Você tem alterações que não foram salvas. Se sair agora, essas alterações serão perdidas." 
 }: LeaveGuardProps) {
   const blocker = useUnsavedChanges(hasChanges);
   const [showDialog, setShowDialog] = useState(false);
 
   useEffect(() => {
     if (blocker.state === "blocked") {
       setShowDialog(true);
     }
   }, [blocker.state]);
 
   const handleConfirm = () => {
     setShowDialog(false);
     blocker.proceed?.();
   };
 
   const handleCancel = () => {
     setShowDialog(false);
     blocker.reset?.();
   };
 
   return (
     <ConfirmationDialog
       open={showDialog}
       onOpenChange={setShowDialog}
       title={title}
       description={description}
       confirmLabel="Sair mesmo assim"
       cancelLabel="Continuar editando"
       onConfirm={handleConfirm}
       onCancel={handleCancel}
       variant="warning"
     />
   );
 }