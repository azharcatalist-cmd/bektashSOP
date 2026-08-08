import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { DEPT_LABELS, type Department } from "@/lib/types";
import { PageHeader, Chip } from "@/components/ui";

export default async function SopDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireProfile();

  const { data: sop } = await supabase.from("sops").select("*").eq("id", id).single();
  if (!sop) notFound();

  const { data: steps } = await supabase
    .from("sop_steps")
    .select("*")
    .eq("sop_id", id)
    .order("position");

  return (
    <>
      <PageHeader
        title={sop.title}
        subtitle={sop.summary ?? undefined}
        action={
          sop.department ? (
            <Chip tone="yellow">{DEPT_LABELS[sop.department as Department]}</Chip>
          ) : undefined
        }
      />
      <ol className="space-y-4">
        {(steps ?? []).map((step, i) => (
          <li key={step.id} className="card">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-black">
                {i + 1}
              </span>
              <h3 className="font-semibold text-zinc-100">{step.title}</h3>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {step.instruction}
            </p>
            {step.photo_url && (
              <img
                src={step.photo_url}
                alt={step.title}
                className="mt-3 max-h-72 rounded-xl border border-brand-line object-cover"
              />
            )}
            {step.video_url && (
              <video
                src={step.video_url}
                controls
                playsInline
                preload="metadata"
                className="mt-3 max-h-80 w-full rounded-xl border border-brand-line"
              />
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
