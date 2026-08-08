"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function markModuleComplete(moduleId: string) {
  const { supabase, profile } = await requireProfile();
  const { error } = await supabase
    .from("training_progress")
    .upsert({ user_id: profile.id, module_id: moduleId }, { onConflict: "user_id,module_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/training");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}
