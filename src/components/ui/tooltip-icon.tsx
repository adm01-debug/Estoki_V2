import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TooltipIconProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function TooltipIcon({ content, side = "top" }: TooltipIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="ml-1 inline-block h-4 w-4 cursor-help text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
