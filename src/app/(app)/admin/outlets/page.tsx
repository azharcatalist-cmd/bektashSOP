import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isAdminLevel, type Outlet } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { saveOutlet } from "../actions";

export default async function AdminOutlets() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role)) redirect("/dashboard");

  const { data: outlets } = await supabase.from("outlets").select("*").order("name");

  return (
    <>
      <PageHeader title="Outlets" subtitle="Bektash outlet locations." />

      <div className="space-y-3">
        {((outlets ?? []) as Outlet[]).map((o) => (
          <form key={o.id} action={saveOutlet} className="card flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={o.id} />
            <input name="name" defaultValue={o.name} className="input w-48" required />
            <input name="code" defaultValue={o.code} className="input w-24" required />
            <input
              name="address"
              defaultValue={o.address ?? ""}
              className="input min-w-40 flex-1"
              placeholder="Address"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="active" defaultChecked={o.active} className="h-4 w-4" />
              Active
            </label>
            <button className="btn-primary text-xs">Save</button>
          </form>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Add outlet
        </h2>
        <form action={saveOutlet} className="card flex flex-wrap items-center gap-3">
          <input name="name" className="input w-48" placeholder="Bektash Edappally" required />
          <input name="code" className="input w-24" placeholder="EDP" required />
          <input name="address" className="input min-w-40 flex-1" placeholder="Address" />
          <button className="btn-primary">Add</button>
        </form>
      </section>
    </>
  );
}
