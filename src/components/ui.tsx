import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const valueColor =
    tone === "good"
      ? "text-emerald-400"
      : tone === "warn"
        ? "text-amber-400"
        : tone === "bad"
          ? "text-red-400"
          : "text-zinc-50";
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

const CHIP_TONES: Record<string, string> = {
  yellow: "bg-brand-yellow/15 text-brand-yellow",
  green: "bg-emerald-500/15 text-emerald-400",
  red: "bg-red-500/15 text-red-400",
  gray: "bg-zinc-500/15 text-zinc-300",
  blue: "bg-sky-500/15 text-sky-400",
  amber: "bg-amber-500/15 text-amber-400",
};

export function Chip({ tone = "gray", children }: { tone?: string; children: ReactNode }) {
  return <span className={`chip ${CHIP_TONES[tone] ?? CHIP_TONES.gray}`}>{children}</span>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card py-10 text-center">
      <p className="font-semibold text-zinc-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

/** Single-hue progress/magnitude bar (brand yellow on dark track). */
export function Bar({ pct, label }: { pct: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-surface">
        <div
          className="h-full rounded-full bg-brand-yellow"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs font-semibold tabular-nums text-zinc-300">
        {label ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}

export const VIOLATION_CHIP: Record<string, { tone: string; label: string }> = {
  issued: { tone: "amber", label: "Issued — with HR" },
  appealed: { tone: "blue", label: "Under appeal" },
  upheld: { tone: "red", label: "Upheld" },
  cancelled: { tone: "gray", label: "Cancelled" },
  paid: { tone: "green", label: "Paid" },
};
