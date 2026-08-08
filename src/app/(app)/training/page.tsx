import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { DEPT_LABELS, type Department } from "@/lib/types";
import { PageHeader, Chip, EmptyState, Bar } from "@/components/ui";

export default async function TrainingPage() {
  const { supabase, profile } = await requireProfile();

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase.from("training_modules").select("*").eq("active", true).order("position"),
    supabase.from("training_progress").select("module_id").eq("user_id", profile.id),
  ]);

  const doneIds = new Set((progress ?? []).map((p) => p.module_id));
  const total = (modules ?? []).length;
  const done = (modules ?? []).filter((m) => doneIds.has(m.id)).length;

  return (
    <>
      <PageHeader
        title="Training"
        subtitle="Complete every module assigned to you. Required modules block onboarding sign-off."
      />

      {total > 0 && (
        <div className="card mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            My progress
          </p>
          <Bar pct={total ? (done / total) * 100 : 0} label={`${done}/${total}`} />
        </div>
      )}

      <div className="space-y-3">
        {(modules ?? []).map((m) => (
          <Link
            key={m.id}
            href={`/training/${m.id}`}
            className="card flex items-center justify-between gap-3 hover:border-brand-yellow/50"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-zinc-100">{m.title}</p>
                {m.required_for_onboarding && <Chip tone="amber">Required</Chip>}
                {m.department && (
                  <Chip tone="yellow">{DEPT_LABELS[m.department as Department]}</Chip>
                )}
              </div>
              {m.description && <p className="mt-1 text-xs text-zinc-500">{m.description}</p>}
            </div>
            {doneIds.has(m.id) ? <Chip tone="green">Complete</Chip> : <Chip tone="gray">To do</Chip>}
          </Link>
        ))}
        {total === 0 && <EmptyState title="No training modules yet" />}
      </div>
    </>
  );
}
