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
  onBack,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="mb-6 space-y-4">
      {showBreadcrumbs && <Breadcrumbs className="px-0" />}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 shrink-0 rounded-xl border-border/40"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
