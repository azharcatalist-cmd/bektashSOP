import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { TEMPLATE_TYPE_LABELS, isAdminLevel, type TemplateType } from "@/lib/types";
import { PageHeader, Chip } from "@/components/ui";
import { addItem, deleteItem } from "../../actions";

export default async function TemplateDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role)) redirect("/dashboard");

  const { data: template } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (!template) notFound();

  const { data: items } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("template_id", id)
    .order("position");

  const nextPos = ((items ?? []).at(-1)?.position ?? 0) + 1;

  return (
    <>
      <PageHeader
        title={template.name}
        subtitle={template.description ?? undefined}
        action={<Chip tone="yellow">{TEMPLATE_TYPE_LABELS[template.type as TemplateType]}</Chip>}
      />

      <div className="space-y-2">
        {(items ?? []).map((item) => (
          <div key={item.id} className="card flex items-center gap-3 py-3">
            <span className="w-6 text-right text-xs text-zinc-500">{item.position}.</span>
            <p className="min-w-0 flex-1 text-sm text-zinc-200">{item.text}</p>
            {item.requires_photo && <span title="Photo required">📷</span>}
            {item.critical && <span title="Critical">🔴</span>}
            <form action={deleteItem}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="template_id" value={id} />
              <button className="text-xs text-zinc-500 hover:text-red-400">Remove</button>
            </form>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">Add item</h2>
        <form action={addItem} className="card space-y-3">
          <input type="hidden" name="template_id" value={id} />
          <div className="flex flex-wrap items-center gap-3">
            <input
              name="position"
              type="number"
              defaultValue={nextPos}
              className="input w-20"
              title="Position"
            />
            <input
              name="text"
              className="input min-w-52 flex-1"
              placeholder="Checklist item text"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="requires_photo" className="h-4 w-4" /> 📷 Photo required
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="critical" className="h-4 w-4" /> 🔴 Critical (raises
              alert on failure)
            </label>
            <button className="btn-primary ml-auto">Add item</button>
          </div>
        </form>
      </section>
    </>
  );
}
