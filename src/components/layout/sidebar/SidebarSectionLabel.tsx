export function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-3 my-3 h-px bg-sidebar-border/20" />;
  return (
    <p className="mt-6 mb-2 flex items-center gap-2 px-3 text-[10px] font-bold tracking-[0.15em] text-sidebar-foreground/80 uppercase">
      {label}
      <span className="h-px flex-1 bg-sidebar-border/20" />
    </p>
  );
}
