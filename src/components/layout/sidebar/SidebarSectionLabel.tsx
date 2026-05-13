export function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
   if (collapsed) return <div className="my-3 mx-3 h-px bg-sidebar-border/20" />;
   return (
     <p className="px-3 text-[10px] font-bold text-sidebar-foreground/30 uppercase tracking-[0.15em] mb-2 mt-6 flex items-center gap-2">
       {label}
       <span className="flex-1 h-px bg-sidebar-border/20" />
     </p>
   );
}
