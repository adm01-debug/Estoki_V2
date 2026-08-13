import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { History, RotateCcw, Eye, Loader2, GitCompare } from "lucide-react";
import { useEntityVersions, EntityVersion } from "@/hooks/useEntityVersions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VersionHistoryProps {
  entityType: string;
  entityId: string;
  onRestore?: (data: Record<string, any>) => void;
}

export function VersionHistory({ entityType, entityId, onRestore }: VersionHistoryProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<EntityVersion | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  const { versions, isLoading, restoreVersion, isRestoring, getVersionData } = useEntityVersions({
    entityType,
    entityId,
  });

  const handlePreview = (version: EntityVersion) => {
    setSelectedVersion(version);
    setShowPreview(true);
  };

  const handleRestore = () => {
    if (!selectedVersion) return;

    restoreVersion(selectedVersion.version_number);
    setShowConfirmRestore(false);

    if (onRestore) {
      const data = getVersionData(selectedVersion.version_number);
      if (data) onRestore(data);
    }
  };

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case "create":
        return <Badge variant="default">Criado</Badge>;
      case "update":
        return <Badge variant="secondary">Atualizado</Badge>;
      case "restore":
        return <Badge variant="outline">Restaurado</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            Histórico
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Versões
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <History className="mb-2 h-10 w-10 opacity-50" />
              <p>Nenhuma versão registrada</p>
            </div>
          ) : (
            <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`rounded-lg border p-3 ${
                      index === 0 ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          v{version.version_number}
                        </span>
                        {getChangeTypeBadge(version.change_type)}
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handlePreview(version)}
                          title="Visualizar"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setSelectedVersion(version);
                              setShowConfirmRestore(true);
                            }}
                            title="Restaurar"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(version.changed_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {version.user?.full_name && ` por ${version.user.full_name}`}
                    </p>

                    {version.diff && Object.keys(version.diff).length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Alterado:</span>{" "}
                        {Object.keys(version.diff).join(", ")}
                      </div>
                    )}

                    {version.change_summary && (
                      <p className="mt-1 text-xs text-muted-foreground">{version.change_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Versão {selectedVersion?.version_number} - {selectedVersion?.change_type}
            </DialogTitle>
          </DialogHeader>
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
            {JSON.stringify(selectedVersion?.data, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmRestore} onOpenChange={setShowConfirmRestore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar Versão {selectedVersion?.version_number}?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Esta ação irá restaurar o registro para o estado da versão{" "}
            {selectedVersion?.version_number}. A versão atual será salva no histórico.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmRestore(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
