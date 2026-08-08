import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { DEPT_LABELS, isAdminLevel, type Department } from "@/lib/types";
import { PageHeader, Chip } from "@/components/ui";
import { createSop, addSopStep } from "../actions";

export default async function AdminSops() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role)) redirect("/dashboard");

  const { data: sops } = await supabase
    .from("sops")
    .select("*, sop_steps(count)")
    .order("category")
    .order("title");

  return (
    <>
      <PageHeader
        title="Manage SOPs"
        subtitle="Create an SOP, then add steps below. For photos/videos: upload the file in Supabase Storage (sop-media bucket) or paste any hosted URL (e.g. YouTube-hosted MP4 links won't work — use direct file URLs)."
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">New SOP</h2>
        <form action={createSop} className="card flex flex-wrap items-center gap-3">
          <input name="title" className="input w-64" placeholder="SOP title" required />
          <input name="category" className="input w-44" placeholder="Category" defaultValue="Food Preparation" />
          <select name="department" className="input w-auto" defaultValue="">
            <option value="">All departments</option>
            {(Object.keys(DEPT_LABELS) as Department[]).map((d) => (
              <option key={d} value={d}>
                {DEPT_LABELS[d]}
              </option>
            ))}
          </select>
          <input name="summary" className="input min-w-40 flex-1" placeholder="One-line summary" />
          <button className="btn-primary">Create</button>
        </form>
      </section>

      <div className="space-y-6">
        {(sops ?? []).map((sop) => {
          const stepCount = (sop.sop_steps as { count: number }[] | null)?.[0]?.count ?? 0;
          return (
            <div key={sop.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/sops/${sop.id}`}
                    className="font-semibold text-zinc-100 hover:text-brand-yellow"
                  >
                    {sop.title}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {sop.category} · {stepCount} steps
                  </p>
                </div>
                {sop.department && (
                  <Chip tone="yellow">{DEPT_LABELS[sop.department as Department]}</Chip>
                )}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand-yellow">
                  + Add step
                </summary>
                <form action={addSopStep} className="mt-3 space-y-3">
                  <input type="hidden" name="sop_id" value={sop.id} />
                  <div className="flex flex-wrap gap-3">
                    <input
                      name="position"
                      type="number"
                      defaultValue={stepCount + 1}
                      className="input w-20"
                      title="Step number"
                    />
                    <input
                      name="title"
                      className="input min-w-52 flex-1"
                      placeholder="Step title"
                      required
                    />
                  </div>
                  <textarea
                    name="instruction"
                    className="input"
                    rows={3}
                    placeholder="Step instructions…"
                    required
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="photo_url" className="input" placeholder="Photo URL (optional)" />
                    <input
                      name="video_url"
                      className="input"
                      placeholder="Video URL (optional, direct .mp4 link)"
                    />
                  </div>
                  <button className="btn-primary">Add step</button>
                </form>
              </details>
            </div>
          );
        })}
      </div>
    </>
  );
}
