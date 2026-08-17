"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function markModuleComplete(moduleId: string) {
  const { supabase, profile } = await requireProfile();

  // modules with a quiz can only be completed by passing the quiz
  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);
  if ((count ?? 0) > 0) throw new Error("This module requires passing the quiz");

  const { error } = await supabase
    .from("training_progress")
    .upsert({ user_id: profile.id, module_id: moduleId }, { onConflict: "user_id,module_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/training");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

const PASS_MARK = 80;

/** Grade a quiz server-side; a pass (>= 80%) marks the module complete. */
export async function gradeQuiz(moduleId: string, answers: number[]) {
  const { supabase, profile } = await requireProfile();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, correct_index")
    .eq("module_id", moduleId)
    .order("position");
  if (!questions?.length) throw new Error("This module has no quiz");

  const correct = questions.filter((q, i) => answers[i] === q.correct_index).length;
  const pct = Math.round((correct / questions.length) * 100);
  const passed = pct >= PASS_MARK;

  if (passed) {
    const { error } = await supabase
      .from("training_progress")
      .upsert({ user_id: profile.id, module_id: moduleId }, { onConflict: "user_id,module_id" });
    if (error) throw new Error(error.message);
    revalidatePath("/training");
    revalidatePath("/onboarding");
    revalidatePath("/dashboard");
  }

  return { passed, pct, correct, total: questions.length, passMark: PASS_MARK };
}
