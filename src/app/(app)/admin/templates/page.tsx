import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  TEMPLATE_TYPE_LABELS,
  isAdminLevel,
  type ChecklistTemplate,
  type TemplateType,
} from "@/lib/types";
import { PageHeader, Chip } from "@/components/ui";
import { createTemplate, toggleTemplate } from "../actions";

export default async function AdminTemplates() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminLevel(profile.role)) redirect("/dashboard");

  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("*, checklist_items(count)")
    .order("type");

  return (
    <>
      <PageHeader
        title="Checklist templates"
        subtitle="Click a template to edit its items. Inactive templates are hidden from outlets."
      />

      <div className="space-y-3">
        {(templates ?? []).map((t) => {
          const itemCount =
            (t.checklist_items as { count: number }[] | null)?.[0]?.count ?? 0;
          return (
            <div key={t.id} className="card flex flex-wrap items-center gap-3">
              <Link href={`/admin/templates/${t.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-100 hover:text-brand-yellow">{t.name}</p>
                  <Chip tone="yellow">
                    {TEMPLATE_TYPE_LABELS[(t as ChecklistTemplate).type]}
                  </Chip>
                  {!t.active && <Chip tone="gray">Inactive</Chip>}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{itemCount} items</p>
              </Link>
              <form action={toggleTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="active" value={(!t.active).toString()} />
                <button className="btn-ghost text-xs">
                  {t.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          New template
        </h2>
        <form action={createTemplate} className="card flex flex-wrap items-center gap-3">
          <input name="name" className="input w-64" placeholder="Template name" required />
          <select name="type" className="input w-auto" defaultValue="custom">
            {(Object.keys(TEMPLATE_TYPE_LABELS) as TemplateType[]).map((t) => (
              <option key={t} value={t}>
                {TEMPLATE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            name="description"
            className="input min-w-40 flex-1"
            placeholder="Short description"
          />
          <button className="btn-primary">Create</button>
        </form>
      </section>
    </>
  );
}
