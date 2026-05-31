import { AppLayout } from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookOpen, LifeBuoy, MessageSquare, Video, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
  const faqs = [
    {
      q: "Como realizar um inventário cíclico?",
      a: "Vá em Estoque > Inventário Cíclico, selecione as posições e siga o passo a passo de conferência cega.",
    },
    {
      q: "O que fazer em caso de divergência no recebimento?",
      a: "Abra a triagem do lote, registre as fotos do produto e marque como 'Divergente' para que o supervisor possa validar.",
    },
    {
      q: "Como configurar alertas de estoque?",
      a: "Acesse Configurações > Alertas e defina os níveis mínimo e crítico para cada categoria de produto.",
    },
  ];

  return (
    <AppLayout title="Central de Ajuda" showBack>
      <BasePageTemplate
        title="Central de Ajuda"
        description="Encontre guias, tutoriais e suporte para otimizar sua operação."
      >
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { icon: BookOpen, label: "Documentação", color: "text-blue-500", bg: "bg-blue-50" },
            {
              icon: Video,
              label: "Tutoriais em Vídeo",
              color: "text-purple-500",
              bg: "bg-purple-50",
            },
            {
              icon: MessageSquare,
              label: "Suporte Online",
              color: "text-green-500",
              bg: "bg-green-50",
            },
            { icon: LifeBuoy, label: "Comunidade", color: "text-orange-500", bg: "bg-orange-50" },
          ].map((item, i) => (
            <Card key={i} className="group cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div
                  className={`${item.bg} ${item.color} rounded-2xl p-4 transition-transform group-hover:scale-110`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight">
                  Perguntas Frequentes
                </CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar dúvida..." className="h-10 rounded-xl pl-10" />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-bold">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm font-medium leading-relaxed text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base font-black tracking-tight">
                  Precisa de mais ajuda?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Nosso time de suporte está disponível de Seg a Sex, das 08h às 18h.
                </p>
                <Button className="w-full rounded-xl text-xs font-black uppercase tracking-widest">
                  Falar com Consultor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
}
