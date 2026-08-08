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
import { updateUser } from "../actions";

export default async function AdminUsers() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role) && profile.role !== "hr") redirect("/dashboard");

  const [{ data: users }, { data: outlets }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("outlets").select("*").order("name"),
  ]);

  return (
    <>
      <PageHeader
        title="Users & access"
        subtitle="New sign-ups appear here as Staff — assign their role, outlet and department. Untick Active to revoke access."
      />
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
                {((outlets ?? []) as Outlet[]).map((o) => (
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
