import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { checklistItems } from "./constants";

interface ChecklistCardProps {
  checklist: Record<string, boolean>;
  onChecklistChange: (itemId: string, checked: boolean) => void;
}

export function ChecklistCard({ checklist, onChecklistChange }: ChecklistCardProps) {
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const progresso = (checkedCount / checklistItems.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Checklist de Inspeção</CardTitle>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{checkedCount}/{checklistItems.length}</span>
          </div>
          <Progress value={progresso} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
              <Checkbox
                id={item.id}
                checked={checklist[item.id] || false}
                onCheckedChange={(checked) => onChecklistChange(item.id, checked as boolean)}
              />
              <label
                htmlFor={item.id}
                className="text-sm cursor-pointer flex-1"
              >
                {item.label}
              </label>
              {checklist[item.id] && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
