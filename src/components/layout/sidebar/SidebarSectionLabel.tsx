export function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-3 mx-3 border-t border-sidebar-border/50" />;
  return (
    <p className="px-3 text-[10px] font-bold text-primary/50 uppercase tracking-[0.2em] mb-1.5 mt-5 flex items-center gap-2">
      <span className="w-4 h-px bg-primary/20" />
      {label}
    </p>
  );
}
