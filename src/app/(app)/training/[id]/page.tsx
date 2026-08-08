import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Chip } from "@/components/ui";
import { markModuleComplete } from "../actions";

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();

  const { data: module } = await supabase.from("training_modules").select("*").eq("id", id).single();
  if (!module) notFound();

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("training_lessons").select("*").eq("module_id", id).order("position"),
    supabase
      .from("training_progress")
      .select("id, completed_at")
      .eq("user_id", profile.id)
      .eq("module_id", id)
      .maybeSingle(),
  ]);

  const completeAction = markModuleComplete.bind(null, id);

  return (
    <>
      <PageHeader
        title={module.title}
        subtitle={module.description ?? undefined}
        action={progress ? <Chip tone="green">Complete</Chip> : undefined}
      />

      <ol className="space-y-4">
        {(lessons ?? []).map((lesson, i) => (
          <li key={lesson.id} className="card">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-black">
                {i + 1}
              </span>
              <h3 className="font-semibold text-zinc-100">{lesson.title}</h3>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {lesson.content}
            </p>
            {lesson.image_url && (
              <img
                src={lesson.image_url}
                alt={lesson.title}
                className="mt-3 max-h-72 rounded-xl border border-brand-line object-cover"
              />
            )}
            {lesson.video_url && (
              <video
                src={lesson.video_url}
                controls
                playsInline
                preload="metadata"
                className="mt-3 max-h-80 w-full rounded-xl border border-brand-line"
              />
            )}
          </li>
        ))}
      </ol>

      {!progress && (
        <form action={completeAction} className="mt-6">
          <button className="btn-primary w-full md:w-auto">
            I have read and understood this module — mark complete
          </button>
        </form>
      )}
    </>
  );
}
