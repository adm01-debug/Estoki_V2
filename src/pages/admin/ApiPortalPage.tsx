import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, BookOpen } from "lucide-react";

const SWAGGER_CSS = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css";
const SWAGGER_JS = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js";

export default function ApiPortalPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document.querySelector(`link[href="${SWAGGER_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = SWAGGER_CSS;
      document.head.appendChild(link);
    }

    const boot = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (!w.SwaggerUIBundle || !containerRef.current) return;
      w.SwaggerUIBundle({
        url: "/openapi.json",
        domNode: containerRef.current,
        deepLinking: true,
        docExpansion: "list",
        tryItOutEnabled: true,
        persistAuthorization: true,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).SwaggerUIBundle) {
      boot();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SWAGGER_JS}"]`);
    if (existing) {
      existing.addEventListener("load", boot);
      return () => existing.removeEventListener("load", boot);
    }
    const script = document.createElement("script");
    script.src = SWAGGER_JS;
    script.async = true;
    script.onload = boot;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Portal da API — ESTOKI WMS</title>
        <meta name="description" content="Documentação interativa (OpenAPI 3.1) das Edge Functions públicas do ESTOKI WMS." />
      </Helmet>

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Portal da API
          </h1>
          <p className="text-muted-foreground mt-1">
            Especificação OpenAPI 3.1 com try-it-out. Endpoints validados por Zod e protegidos por rate limit.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/openapi.json" download>
              <Download className="h-4 w-4 mr-2" />
              openapi.json
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://editor.swagger.io/?url=/openapi.json" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no editor
            </a>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Referência interativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="swagger-ui-host bg-background rounded" />
        </CardContent>
      </Card>
    </div>
  );
}