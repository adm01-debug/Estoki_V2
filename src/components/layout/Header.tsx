import { Menu, Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps { onMenuClick?: () => void; }

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{user?.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
