export function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-3 my-3 h-px bg-sidebar-border/20" />;
  return (
    <p className="mb-2 mt-6 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">
      {label}
      <span className="h-px flex-1 bg-sidebar-border/20" />
    </p>
  );
}
