import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };

export function AvatarGroup({ users, max = 4, size = "md" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map(user => (
        <Avatar key={user.id} className={cn(sizes[size], "border-2 border-background")}>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className={cn(sizes[size], "rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium")}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
