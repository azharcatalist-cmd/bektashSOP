import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { FINE_ISSUER_ROLES, type Outlet, type Profile } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import NewFineForm from "./new-fine-form";

export default async function NewFinePage() {
  const { supabase, profile } = await requireProfile();
  if (!FINE_ISSUER_ROLES.includes(profile.role)) redirect("/fines");

  const [{ data: outlets }, { data: staff }] = await Promise.all([
    supabase.from("outlets").select("*").eq("active", true).order("name"),
    supabase.from("profiles").select("id, full_name, outlet_id, role").eq("active", true).order("full_name"),
  ]);

  return (
    <>
      <PageHeader
        title="File a violation"
        subtitle="Attach evidence (photo or CCTV reference). The fine is forwarded to HR automatically."
      />
      <NewFineForm
        outlets={(outlets ?? []) as Outlet[]}
        staff={(staff ?? []) as Pick<Profile, "id" | "full_name" | "outlet_id" | "role">[]}
      />
    </>
  );
}
