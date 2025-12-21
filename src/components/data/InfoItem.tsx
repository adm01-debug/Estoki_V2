import { cn } from "@/lib/utils";

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export function InfoItem({ label, value, className, horizontal }: InfoItemProps) {
  return (
    <div className={cn(horizontal ? "flex items-center justify-between" : "space-y-1", className)}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ?? "-"}</dd>
    </div>
  );
}

export function InfoList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn("space-y-3", className)}>{children}</dl>;
}
