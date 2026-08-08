import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import {
  FINE_ISSUER_ROLES,
  FINE_DECIDER_ROLES,
  isOutletManager,
  type Violation,
} from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";
import { PageHeader, Chip, EmptyState, VIOLATION_CHIP } from "@/components/ui";
import { appealFine, decideFine, markFinePaid } from "./actions";

export default async function FinesPage() {
  const { supabase, profile } = await requireProfile();

  const { data: fines } = await supabase
    .from("violations")
    .select("*, outlets(name), staff:staff_id(full_name), reporter:reported_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const canIssue = FINE_ISSUER_ROLES.includes(profile.role);
  const canDecide = FINE_DECIDER_ROLES.includes(profile.role);

  return (
    <>
      <PageHeader
        title="Fines & appeals"
        subtitle="Audit findings with fines are forwarded to HR. Appeals are reviewed by HR — valid appeals get the fine cancelled."
        action={
          canIssue ? (
            <Link href="/fines/new" className="btn-primary">
              + File violation
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {(fines ?? []).map((f) => {
          const chip = VIOLATION_CHIP[f.status];
          const outlet = f.outlets as { name: string } | null;
          const staff = f.staff as { full_name: string } | null;
          const reporter = f.reporter as { full_name: string } | null;
          const canAppeal =
            f.status === "issued" &&
            (f.staff_id === profile.id ||
              (isOutletManager(profile.role) && f.outlet_id === profile.outlet_id));

          return (
            <div key={f.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-100">{f.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {outlet?.name}
                    {staff ? ` · ${staff.full_name}` : " · outlet-level"} · filed by{" "}
                    {reporter?.full_name} · {formatDateTime(f.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums text-zinc-100">
                    {formatINR(f.fine_amount)}
                  </span>
                  <Chip tone={chip?.tone}>{chip?.label ?? f.status}</Chip>
                </div>
              </div>

              {f.description && <p className="mt-2 text-sm text-zinc-300">{f.description}</p>}

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                {f.cctv_ref && <span>🎥 CCTV: {f.cctv_ref}</span>}
                {f.evidence_url && (
                  <a
                    href={f.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-yellow hover:underline"
                  >
                    📎 View evidence
                  </a>
                )}
              </div>

              {f.appeal_note && (
                <div className="mt-3 rounded-xl bg-brand-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                    Appeal
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{f.appeal_note}</p>
                </div>
              )}
              {f.hr_note && (
                <div className="mt-2 rounded-xl bg-brand-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    HR decision note
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{f.hr_note}</p>
                </div>
              )}

              {/* Appeal form for the fined party */}
              {canAppeal && (
                <form action={appealFine} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="id" value={f.id} />
                  <input
                    name="appeal_note"
                    className="input flex-1"
                    placeholder="Why should this fine be reconsidered?"
                    required
                  />
                  <button className="btn-ghost">Submit appeal</button>
                </form>
              )}

              {/* HR decision controls */}
              {canDecide && (f.status === "issued" || f.status === "appealed") && (
                <form action={decideFine} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="id" value={f.id} />
                  <input
                    name="hr_note"
                    className="input flex-1"
                    placeholder="Decision note (visible to the team)"
                  />
                  <div className="flex gap-2">
                    <button name="decision" value="upheld" className="btn-danger">
                      Uphold fine
                    </button>
                    <button name="decision" value="cancelled" className="btn-ghost">
                      Cancel fine
                    </button>
                  </div>
                </form>
              )}
              {canDecide && f.status === "upheld" && (
                <form action={markFinePaid} className="mt-3">
                  <input type="hidden" name="id" value={f.id} />
                  <button className="btn-ghost text-xs">Mark as paid / recovered</button>
                </form>
              )}
            </div>
          );
        })}
        {(fines ?? []).length === 0 && (
          <EmptyState
            title="No fines on record"
            hint="That's the goal — keep checklists honest and SOPs followed."
          />
        )}
      </div>
    </>
  );
}
