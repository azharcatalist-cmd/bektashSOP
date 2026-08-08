import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS, isUpper, isAdminLevel, type Role } from "@/lib/types";
import LogoutButton from "@/components/logout-button";
import NavLinks from "@/components/nav-links";

export type NavItem = { href: string; label: string; icon: string };

function navFor(role: Role): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", label: "Home", icon: "🏠" }];
  items.push({ href: "/checklists", label: "Checklists", icon: "✅" });
  items.push({ href: "/sops", label: "SOPs", icon: "📖" });
  items.push({ href: "/training", label: "Training", icon: "🎓" });
  items.push({ href: "/onboarding", label: "Onboarding", icon: "🧭" });
  items.push({ href: "/fines", label: "Fines", icon: "⚖️" });
  items.push({ href: "/alerts", label: "Alerts", icon: "🚨" });
  if (isUpper(role) || role === "store_manager" || role === "shift_manager") {
    items.push({ href: "/reports", label: "Reports", icon: "📊" });
  }
  if (isAdminLevel(role)) {
    items.push({ href: "/admin", label: "Admin", icon: "⚙️" });
  }
  return items;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();
  const nav = navFor(profile.role);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-brand-line p-5 md:flex">
        <img src="/logo.svg" alt="bektash" className="mb-1 h-10 self-start" />
        <p className="mb-6 text-[11px] text-zinc-500">Operations Platform</p>
        <NavLinks items={nav} variant="side" />
        <div className="mt-auto pt-6">
          <p className="truncate text-sm font-semibold text-zinc-200">{profile.full_name}</p>
          <p className="text-xs text-zinc-500">
            {ROLE_LABELS[profile.role]}
            {profile.outlets ? ` · ${profile.outlets.name}` : ""}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-line bg-brand-black/90 px-4 py-3 backdrop-blur md:hidden">
          <img src="/logo.svg" alt="bektash" className="h-8" />
          <span className="text-xs text-zinc-400">
            {profile.full_name.split(" ")[0]} · {ROLE_LABELS[profile.role]}
          </span>
        </header>

        <main className="px-4 pb-28 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-line bg-brand-black/95 backdrop-blur md:hidden">
        <NavLinks items={nav.slice(0, 5)} variant="bottom" />
      </nav>
    </div>
  );
}
