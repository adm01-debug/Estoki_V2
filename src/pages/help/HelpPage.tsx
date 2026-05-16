 import { AppLayout } from "@/components/layout/AppLayout";
 import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 import { BookOpen, LifeBuoy, MessageSquare, Video, Search } from "lucide-react";
 import { Input } from "@/components/ui/input";

 export default function HelpPage() {
   const faqs = [
     { q: "Como realizar um inventário cíclico?", a: "Vá em Estoque > Inventário Cíclico, selecione as posições e siga o passo a passo de conferência cega." },
     { q: "O que fazer em caso de divergência no recebimento?", a: "Abra a triagem do lote, registre as fotos do produto e marque como 'Divergente' para que o supervisor possa validar." },
     { q: "Como configurar alertas de estoque?", a: "Acesse Configurações > Alertas e defina os níveis mínimo e crítico para cada categoria de produto." }
   ];

   return (
     <AppLayout title="Central de Ajuda" showBack>
       <BasePageTemplate 
         title="Central de Ajuda" 
         description="Encontre guias, tutoriais e suporte para otimizar sua operação."
       >
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           {[
             { icon: BookOpen, label: "Documentação", color: "text-blue-500", bg: "bg-blue-50" },
             { icon: Video, label: "Tutoriais em Vídeo", color: "text-purple-500", bg: "bg-purple-50" },
             { icon: MessageSquare, label: "Suporte Online", color: "text-green-500", bg: "bg-green-50" },
             { icon: LifeBuoy, label: "Comunidade", color: "text-orange-500", bg: "bg-orange-50" }
           ].map((item, i) => (
             <Card key={i} className="hover:shadow-md transition-all cursor-pointer group">
               <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                 <div className={`${item.bg} ${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                   <item.icon className="h-6 w-6" />
                 </div>
                 <span className="font-bold text-sm tracking-tight">{item.label}</span>
               </CardContent>
             </Card>
           ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg font-black tracking-tight">Perguntas Frequentes</CardTitle>
                 <div className="relative mt-2">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Buscar dúvida..." className="pl-10 h-10 rounded-xl" />
                 </div>
               </CardHeader>
               <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                   {faqs.map((faq, i) => (
                     <AccordionItem key={i} value={`item-${i}`}>
                       <AccordionTrigger className="text-sm font-bold text-left">{faq.q}</AccordionTrigger>
                       <AccordionContent className="text-muted-foreground text-sm font-medium leading-relaxed">
                         {faq.a}
                       </AccordionContent>
                     </AccordionItem>
                   ))}
                 </Accordion>
               </CardContent>
             </Card>
           </div>
           
           <div className="space-y-6">
             <Card className="bg-primary/5 border-primary/20">
               <CardHeader>
                 <CardTitle className="text-base font-black tracking-tight">Precisa de mais ajuda?</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <p className="text-xs font-medium text-muted-foreground">Nosso time de suporte está disponível de Seg a Sex, das 08h às 18h.</p>
                 <Button className="w-full rounded-xl font-black text-xs uppercase tracking-widest">Falar com Consultor</Button>
               </CardContent>
             </Card>
           </div>
         </div>
       </BasePageTemplate>
     </AppLayout>
   );
 }
