import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Loads the signed-in user's profile (with outlet name) or redirects to /login.
 * Returns the server supabase client too, so pages don't create a second one.
 */
export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, outlets(name, code)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (!profile.active) redirect("/login?disabled=1");

  return { supabase, user, profile: profile as Profile };
}
