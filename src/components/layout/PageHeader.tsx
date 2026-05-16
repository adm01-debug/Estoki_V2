 import { Breadcrumbs } from "@/components/common/Breadcrumbs";
 import { Button } from "@/components/ui/button";
 import { ChevronLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";

 interface PageHeaderProps {
   title: string;
   description?: string;
   actions?: React.ReactNode;
   showBreadcrumbs?: boolean;
   showBack?: boolean;
   onBack?: () => void;
 }
 
 export function PageHeader({ 
   title, 
   description, 
   actions, 
   showBreadcrumbs = true,
   showBack = false,
   onBack
 }: PageHeaderProps) {
   const navigate = useNavigate();
   const handleBack = onBack || (() => navigate(-1));
 
   return (
     <div className="mb-6 space-y-4">
       {showBreadcrumbs && <Breadcrumbs className="px-0" />}
       
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-3">
           {showBack && (
             <Button variant="outline" size="icon" onClick={handleBack} className="h-9 w-9 rounded-xl border-border/40 shrink-0">
               <ChevronLeft className="h-5 w-5" />
             </Button>
           )}
           <div>
             <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
             {description && <p className="text-sm text-muted-foreground mt-1 font-medium">{description}</p>}
           </div>
         </div>
         {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
       </div>
     </div>
   );
 }
