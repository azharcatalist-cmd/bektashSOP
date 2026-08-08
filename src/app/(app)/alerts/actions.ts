"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { isUpper, isOutletManager } from "@/lib/types";

export async function resolveAlert(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (!isUpper(profile.role) && !isOutletManager(profile.role)) {
    throw new Error("Only managers can resolve alerts");
  }
  const { error } = await supabase
    .from("alerts")
    .update({ resolved: true, resolved_by: profile.id })
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}
