import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { DEPT_LABELS, type Department } from "@/lib/types";
import { PageHeader, Chip, EmptyState } from "@/components/ui";

export default async function SopsPage() {
  const { supabase } = await requireProfile();
  const { data: sops } = await supabase
    .from("sops")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("title");

  const byCategory = new Map<string, NonNullable<typeof sops>>();
  for (const sop of sops ?? []) {
    const list = byCategory.get(sop.category) ?? [];
    list.push(sop);
    byCategory.set(sop.category, list);
  }

  return (
    <>
      <PageHeader
        title="Standard Operating Procedures"
        subtitle="How every Bektash item is prepared and every station is run — follow these exactly."
      />
      {[...byCategory.entries()].map(([category, list]) => (
        <section key={category} className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
            {category}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((sop) => (
              <Link key={sop.id} href={`/sops/${sop.id}`} className="card hover:border-brand-yellow/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-zinc-100">{sop.title}</p>
                  {sop.department && (
                    <Chip tone="yellow">{DEPT_LABELS[sop.department as Department]}</Chip>
                  )}
                </div>
                {sop.summary && <p className="mt-1 text-xs text-zinc-500">{sop.summary}</p>}
              </Link>
            ))}
          </div>
        </section>
      ))}
      {(sops ?? []).length === 0 && (
        <EmptyState title="No SOPs yet" hint="Admins can add SOPs from the Admin panel." />
      )}
    </>
  );
}
