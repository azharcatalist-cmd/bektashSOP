"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

export default function NavLinks({ items, variant }: { items: Item[]; variant: "side" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "bottom") {
    return (
      <div className="grid auto-cols-fr grid-flow-col">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                active ? "text-brand-yellow" : "text-zinc-500"
              }`}
            >
              <span className="text-lg leading-none">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((it) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-yellow/10 text-brand-yellow"
                : "text-zinc-400 hover:bg-brand-card hover:text-zinc-200"
            }`}
          >
            <span>{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
