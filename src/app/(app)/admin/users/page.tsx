import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  ROLE_LABELS,
  DEPT_LABELS,
  isAdminLevel,
  type Outlet,
  type Profile,
  type Role,
  type Department,
} from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { createUser, updateUser } from "../actions";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { created, error } = await searchParams;
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role) && profile.role !== "hr") redirect("/dashboard");

  const [{ data: users }, { data: outlets }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("outlets").select("*").order("name"),
  ]);

  const outletList = (outlets ?? []) as Outlet[];

  return (
    <>
      <PageHeader
        title="Users & access"
        subtitle="Create accounts directly, or assign roles to self-signups. Untick Active to revoke access."
      />

      {created && (
        <div className="card mb-4 border-emerald-500/40">
          <p className="text-sm font-semibold text-emerald-400">
            ✓ Account created for {created} — share the password with them privately; they can
            change it later.
          </p>
        </div>
      )}
      {error && (
        <div className="card mb-4 border-red-500/40">
          <p className="text-sm font-semibold text-red-400">Could not create user: {error}</p>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Create a user
        </h2>
        <form action={createUser} className="card space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Full name *</label>
              <input name="full_name" className="input" required placeholder="e.g. Fathima N" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                name="email"
                type="email"
                className="input"
                required
                placeholder="name@bektash.in"
              />
            </div>
            <div>
              <label className="label">Temporary password *</label>
              <input
                name="password"
                className="input"
                required
                minLength={6}
                placeholder="min 6 characters"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Role</label>
              <select name="role" defaultValue="staff" className="input w-auto">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select name="department" defaultValue="" className="input w-auto">
                <option value="">No department</option>
                {(Object.keys(DEPT_LABELS) as Department[]).map((d) => (
                  <option key={d} value={d}>
                    {DEPT_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Outlet</label>
              <select name="outlet_id" defaultValue="" className="input w-auto">
                <option value="">No outlet</option>
                {outletList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary ml-auto">Create account</button>
          </div>
        </form>
      </section>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
        All users
      </h2>
      <div className="space-y-3">
        {((users ?? []) as Profile[]).map((u) => (
          <form key={u.id} action={updateUser} className="card">
            <input type="hidden" name="id" value={u.id} />
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-40 flex-1">
                <p className="font-semibold text-zinc-100">{u.full_name || "(no name)"}</p>
                <p className="text-xs text-zinc-500">{ROLE_LABELS[u.role]}</p>
              </div>
              <select name="role" defaultValue={u.role} className="input w-auto">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <select name="department" defaultValue={u.department ?? ""} className="input w-auto">
                <option value="">No department</option>
                {(Object.keys(DEPT_LABELS) as Department[]).map((d) => (
                  <option key={d} value={d}>
                    {DEPT_LABELS[d]}
                  </option>
                ))}
              </select>
              <select name="outlet_id" defaultValue={u.outlet_id ?? ""} className="input w-auto">
                <option value="">No outlet</option>
                {outletList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" name="active" defaultChecked={u.active} className="h-4 w-4" />
                Active
              </label>
              <button className="btn-primary text-xs">Save</button>
            </div>
          </form>
        ))}
      </div>
    </>
  );
}
