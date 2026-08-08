import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isAdminLevel } from "@/lib/types";
import { PageHeader } from "@/components/ui";

export default async function AdminHome() {
  const { profile } = await requireProfile();
  if (!isAdminLevel(profile.role) && profile.role !== "hr") redirect("/dashboard");

  const sections = [
    {
      href: "/admin/users",
      icon: "👥",
      title: "Users & access",
      desc: "Assign roles, outlets and departments; deactivate leavers.",
    },
    {
      href: "/admin/outlets",
      icon: "🏪",
      title: "Outlets",
      desc: "Add or edit Bektash outlets.",
    },
    {
      href: "/admin/templates",
      icon: "📋",
      title: "Checklist templates",
      desc: "Edit opening/closing, weekly and audit checklists.",
    },
    {
      href: "/admin/sops",
      icon: "📖",
      title: "SOPs",
      desc: "Create SOPs and add steps with photos & videos.",
    },
  ];

  return (
    <>
      <PageHeader title="Admin panel" subtitle="Platform configuration and access control." />
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="card hover:border-brand-yellow/50">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-2 font-semibold text-zinc-100">{s.title}</p>
            <p className="text-xs text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
