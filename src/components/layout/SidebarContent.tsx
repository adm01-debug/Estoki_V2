import { memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { useSidebarFavorites } from "@/hooks/useSidebarFavorites";
import {
  SidebarNavButton,
  SidebarAccordionGroup,
  SidebarSectionLabel,
  SidebarHeader,
  SidebarUserInfo,
  SidebarFooter,
  sidebarMainItems,
  sidebarGroups,
  sidebarAdminItems,
  sidebarUtilityItems,
  getAllNavItems,
} from "./sidebar";

interface SidebarContentProps {
  isMobile?: boolean;
  sidebarCollapsed: boolean;
  userName: string;
  userRole: string;
  pathname: string;
  onNavigate: (path: string, isMobile?: boolean) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const SidebarContent = memo(function SidebarContent({
  isMobile = false,
  sidebarCollapsed,
  userName,
  userRole,
  pathname,
  onNavigate,
  onLogout,
  onCloseMobile,
}: SidebarContentProps) {
  const preloadRoute = useRoutePreload();
  const { favorites } = useSidebarFavorites();
  const isCollapsed = sidebarCollapsed && !isMobile;
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = getAllNavItems();
  const filteredItems = searchQuery
    ? allItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const activeElement = document.querySelector('[aria-current="page"]');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [pathname]);

  return (
    <>
      <SidebarHeader isCollapsed={isCollapsed} isMobile={isMobile} onCloseMobile={onCloseMobile} />

      {!isCollapsed && (
        <SidebarUserInfo userName={userName} userRole={userRole} initials={getInitials(userName)} />
      )}

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {!isCollapsed && (
            <div className="sticky top-0 z-20 mb-4 bg-sidebar/95 px-3 py-2 backdrop-blur-sm">
              <div className="group relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/30 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Buscar função..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-lg border-sidebar-border/20 bg-sidebar-accent/30 pl-9 text-sm transition-all focus:bg-sidebar-accent/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {searchQuery ? (
            <div className="space-y-1">
              <SidebarSectionLabel label="Resultados da Busca" collapsed={isCollapsed} />
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <SidebarNavButton
                    key={`search-${item.path}`}
                    item={item}
                    isActive={pathname === item.path}
                    onClick={() => {
                      onNavigate(item.path, isMobile);
                      setSearchQuery("");
                    }}
                    collapsed={isCollapsed}
                    onHover={preloadRoute}
                  />
                ))
              ) : (
                <p className="px-4 py-2 text-xs italic text-sidebar-foreground/40">
                  Nenhum resultado encontrado
                </p>
              )}
            </div>
          ) : (
            <>
              {favorites.length > 0 && (
                <>
                  <SidebarSectionLabel label="Favoritos" collapsed={isCollapsed} />
                  {favorites.map((path) => {
                    const item = allItems.find((i) => i.path === path);
                    if (!item) return null;
                    return (
                      <SidebarNavButton
                        key={`fav-${item.path}`}
                        item={item}
                        isActive={pathname === item.path}
                        onClick={() => onNavigate(item.path, isMobile)}
                        collapsed={isCollapsed}
                        onHover={preloadRoute}
                      />
                    );
                  })}
                </>
              )}

              <SidebarSectionLabel label="Principal" collapsed={isCollapsed} />
              {sidebarMainItems.map((item) => (
                <SidebarNavButton
                  key={item.path}
                  item={item}
                  isActive={pathname === item.path}
                  onClick={() => onNavigate(item.path, isMobile)}
                  collapsed={isCollapsed}
                  onHover={preloadRoute}
                />
              ))}

              <SidebarSectionLabel label="Operações" collapsed={isCollapsed} />
              {sidebarGroups.map((group) => (
                <SidebarAccordionGroup
                  key={group.label}
                  group={group}
                  collapsed={isCollapsed}
                  pathname={pathname}
                  onNavigate={(path) => onNavigate(path, isMobile)}
                  onHover={preloadRoute}
                />
              ))}

              {userRole === "admin" && (
                <>
                  <SidebarSectionLabel label="Administração" collapsed={isCollapsed} />
                  {sidebarAdminItems.map((item) => (
                    <SidebarNavButton
                      key={item.path}
                      item={item}
                      isActive={pathname === item.path}
                      onClick={() => onNavigate(item.path, isMobile)}
                      collapsed={isCollapsed}
                      onHover={preloadRoute}
                    />
                  ))}
                </>
              )}

              <SidebarSectionLabel label="Conta" collapsed={isCollapsed} />
              {sidebarUtilityItems.map((item) => (
                <SidebarNavButton
                  key={item.path}
                  item={item}
                  isActive={pathname === item.path}
                  onClick={() => onNavigate(item.path, isMobile)}
                  collapsed={isCollapsed}
                  onHover={preloadRoute}
                />
              ))}
            </>
          )}
        </nav>
      </ScrollArea>

      <SidebarFooter
        pathname={pathname}
        onNavigate={(path) => onNavigate(path, isMobile)}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
      />
    </>
  );
});
