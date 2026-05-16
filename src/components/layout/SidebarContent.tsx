 import { memo, useEffect } from "react";
 import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { useSidebarFavorites } from "@/hooks/useSidebarFavorites";
import {
  SidebarNavButton, SidebarAccordionGroup, SidebarSectionLabel,
  SidebarHeader, SidebarUserInfo, SidebarFooter,
  sidebarMainItems, sidebarGroups, sidebarAdminItems, 
  sidebarUtilityItems, getAllNavItems,
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
  return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export const SidebarContent = memo(function SidebarContent({
  isMobile = false,
  sidebarCollapsed,
  userName,
  userRole,
  pathname,
  onNavigate,
  onLogout,
  onCloseMobile
}: SidebarContentProps) {
   const preloadRoute = useRoutePreload();
   const { favorites } = useSidebarFavorites();
   const isCollapsed = sidebarCollapsed && !isMobile;
 
   useEffect(() => {
     const activeElement = document.querySelector('[aria-current="page"]');
     if (activeElement) {
       activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
     }
   }, [pathname]);

  return (
    <>
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        onCloseMobile={onCloseMobile} 
      />

      {!isCollapsed && (
        <SidebarUserInfo 
          userName={userName} 
          userRole={userRole} 
          initials={getInitials(userName)} 
        />
      )}

       <ScrollArea className="flex-1 px-3">
         <nav className="py-4 space-y-1">
          {favorites.length > 0 && (
            <>
              <SidebarSectionLabel label="Favoritos" collapsed={isCollapsed} />
              {favorites.map((path) => {
                const item = getAllNavItems().find(i => i.path === path);
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

          {userRole === 'admin' && (
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