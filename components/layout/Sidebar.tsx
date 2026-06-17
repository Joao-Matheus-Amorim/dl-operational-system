import { SidebarNav } from "@/components/layout/SidebarNav";

/** Sidebar fixa do desktop (>= lg). No mobile, ver MobileNav na Topbar. */
export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-background/60 backdrop-blur-xl lg:flex">
      <SidebarNav />
    </aside>
  );
}
