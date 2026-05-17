import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleLabel } from "./sidebarNavData";

interface SidebarUserInfoProps {
  userName: string;
  userRole: string;
  initials: string;
}

export const SidebarUserInfo = memo(function SidebarUserInfo({ 
  userName, 
  userRole, 
  initials 
}: SidebarUserInfoProps) {
  return null;
});
