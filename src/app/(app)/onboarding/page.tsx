import { requireProfile } from "@/lib/auth";
import {
  DEPT_LABELS,
  isUpper,
  isOutletManager,
  type Department,
  type Profile,
} from "@/lib/types";
import { PageHeader, Chip, EmptyState, Bar } from "@/components/ui";
import { completeTask, verifyTask } from "./actions";

export default async function OnboardingPage() {
  const { supabase, profile } = await requireProfile();
  const manager = isUpper(profile.role) || isOutletManager(profile.role);

  const { data: tasks } = await supabase.from("onboarding_tasks").select("*").order("position");
  const myTasks = (tasks ?? []).filter(
    (t) => !t.department || t.department === profile.department
  );

  const { data: myProgress } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", profile.id);

  const progressByTask = new Map((myProgress ?? []).map((p) => [p.task_id, p]));
  const doneCount = myTasks.filter((t) => progressByTask.has(t.id)).length;

  // Manager view: outlet team members' onboarding needing verification
  let team: Profile[] = [];
  let teamProgress: { id: string; user_id: string; task_id: string; verified_by: string | null }[] =
    [];
  if (manager) {
    const teamQuery = supabase.from("profiles").select("*").eq("active", true).neq("id", profile.id);
    const { data: teamData } = isUpper(profile.role)
      ? await teamQuery
      : await teamQuery.eq("outlet_id", profile.outlet_id ?? "00000000-0000-0000-0000-000000000000");
    team = (teamData ?? []) as Profile[];
    if (team.length) {
      const { data: tp } = await supabase
        .from("onboarding_progress")
        .select("id, user_id, task_id, verified_by")
        .in(
          "user_id",
          team.map((t) => t.id)
        );
      teamProgress = tp ?? [];
    }
  }

  const taskById = new Map((tasks ?? []).map((t) => [t.id, t]));
  const pendingVerification = teamProgress.filter((p) => {
    const t = taskById.get(p.task_id);
    return t?.requires_verification && !p.verified_by;
  });

  return (
    <>
      <PageHeader
        title="Onboarding"
        subtitle="Every new Bektash team member completes these before their first solo shift."
      />

      <div className="card mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          My onboarding{profile.department ? ` · ${DEPT_LABELS[profile.department]}` : ""}
        </p>
        <Bar pct={myTasks.length ? (doneCount / myTasks.length) * 100 : 0} label={`${doneCount}/${myTasks.length}`} />
      </div>

      <div className="space-y-3">
        {myTasks.map((task, i) => {
          const p = progressByTask.get(task.id);
          const action = completeTask.bind(null, task.id);
          return (
            <div key={task.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-100">
                    <span className="mr-1 text-zinc-500">{i + 1}.</span>
                    {task.title}
                  </p>
                  {task.department && (
                    <Chip tone="yellow">{DEPT_LABELS[task.department as Department]}</Chip>
                  )}
                </div>
                {task.description && (
                  <p className="mt-1 text-xs text-zinc-500">{task.description}</p>
                )}
                {task.requires_verification && p && !p.verified_by && (
                  <p className="mt-1 text-xs text-amber-400">
                    Waiting for manager verification
                  </p>
                )}
              </div>
              {p ? (
                task.requires_verification ? (
                  p.verified_by ? (
                    <Chip tone="green">Verified</Chip>
                  ) : (
                    <Chip tone="amber">Pending</Chip>
                  )
                ) : (
                  <Chip tone="green">Done</Chip>
                )
              ) : (
                <form action={action}>
                  <button className="btn-ghost text-xs">Mark done</button>
                </form>
              )}
            </div>
          );
        })}
        {myTasks.length === 0 && <EmptyState title="No onboarding tasks configured" />}
      </div>

      {manager && pendingVerification.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
            Team tasks awaiting your verification
          </h2>
          <div className="space-y-2">
            {pendingVerification.map((p) => {
              const t = taskById.get(p.task_id);
              const member = team.find((m) => m.id === p.user_id);
              const action = verifyTask.bind(null, p.id);
              return (
                <div key={p.id} className="card flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-200">
                      {member?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-zinc-500">{t?.title}</p>
                  </div>
                  <form action={action}>
                    <button className="btn-primary text-xs">Verify ✓</button>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
