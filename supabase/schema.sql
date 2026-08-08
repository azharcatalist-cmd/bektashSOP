-- ============================================================
-- Bektash Operations Platform - Database Schema (Supabase)
-- Run this in the Supabase SQL editor BEFORE seed.sql
-- ============================================================

-- ---------- Enums ----------
create type user_role as enum (
  'admin', 'ceo', 'operations_manager', 'area_manager',
  'audit_executive', 'hr', 'store_manager', 'shift_manager', 'staff'
);

create type department as enum ('FOH', 'BOH', 'outlet_ops', 'management');

create type template_type as enum ('opening', 'closing', 'weekly_area', 'ops_audit', 'custom');

create type run_status as enum ('in_progress', 'submitted', 'reviewed');

create type response_status as enum ('done', 'issue', 'na');

create type violation_status as enum ('issued', 'appealed', 'upheld', 'cancelled', 'paid');

create type alert_severity as enum ('info', 'warning', 'critical');

-- ---------- Tables ----------
create table public.outlets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'staff',
  department department,
  outlet_id uuid references public.outlets (id),
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- auto-create a profile whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type template_type not null default 'custom',
  department department,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates (id) on delete cascade,
  position int not null default 0,
  text text not null,
  requires_photo boolean not null default false,
  critical boolean not null default false
);

create table public.checklist_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates (id),
  outlet_id uuid not null references public.outlets (id),
  run_date date not null default (now() at time zone 'Asia/Kolkata')::date,
  status run_status not null default 'in_progress',
  started_by uuid not null references public.profiles (id),
  submitted_at timestamptz,
  score numeric,
  created_at timestamptz not null default now()
);

create table public.checklist_responses (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.checklist_runs (id) on delete cascade,
  item_id uuid not null references public.checklist_items (id),
  status response_status not null default 'done',
  note text,
  photo_url text,
  unique (run_id, item_id)
);

create table public.sops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  department department,
  summary text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sop_steps (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.sops (id) on delete cascade,
  position int not null default 0,
  title text not null,
  instruction text not null default '',
  photo_url text,
  video_url text
);

create table public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department department,
  required_for_onboarding boolean not null default false,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules (id) on delete cascade,
  position int not null default 0,
  title text not null,
  content text not null default '',
  video_url text,
  image_url text
);

create table public.training_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.training_modules (id) on delete cascade,
  completed_at timestamptz not null default now(),
  verified_by uuid references public.profiles (id),
  unique (user_id, module_id)
);

create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  department department, -- null = applies to everyone
  position int not null default 0,
  title text not null,
  description text,
  requires_verification boolean not null default false
);

create table public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid not null references public.onboarding_tasks (id) on delete cascade,
  completed_at timestamptz not null default now(),
  verified_by uuid references public.profiles (id),
  unique (user_id, task_id)
);

create table public.violations (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets (id),
  staff_id uuid references public.profiles (id),
  reported_by uuid not null references public.profiles (id),
  title text not null,
  description text,
  cctv_ref text,
  evidence_url text,
  fine_amount numeric not null default 0,
  status violation_status not null default 'issued',
  appeal_note text,
  appealed_by uuid references public.profiles (id),
  appealed_at timestamptz,
  hr_note text,
  decided_by uuid references public.profiles (id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references public.outlets (id),
  severity alert_severity not null default 'warning',
  title text not null,
  message text,
  source text not null default 'system',
  related_id uuid,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------- Helper functions for RLS ----------
create or replace function public.my_role()
returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.my_outlet()
returns uuid
language sql stable security definer set search_path = public
as $$ select outlet_id from public.profiles where id = auth.uid() $$;

-- upper management: sees everything across outlets
create or replace function public.is_upper()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.my_role() in ('admin', 'ceo', 'operations_manager', 'area_manager', 'audit_executive', 'hr')
$$;

-- outlet-level manager
create or replace function public.is_outlet_manager()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.my_role() in ('store_manager', 'shift_manager')
$$;

create or replace function public.is_admin_level()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.my_role() in ('admin', 'ceo', 'operations_manager')
$$;

-- ---------- Row Level Security ----------
alter table public.outlets enable row level security;
alter table public.profiles enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_runs enable row level security;
alter table public.checklist_responses enable row level security;
alter table public.sops enable row level security;
alter table public.sop_steps enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_lessons enable row level security;
alter table public.training_progress enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.violations enable row level security;
alter table public.alerts enable row level security;

-- outlets: everyone reads, admin-level writes
create policy outlets_select on public.outlets for select to authenticated using (true);
create policy outlets_write on public.outlets for all to authenticated
  using (public.is_admin_level()) with check (public.is_admin_level());

-- profiles: everyone reads (needed for names everywhere); self-update; admin/hr manage
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin_level() or public.my_role() = 'hr');

-- checklist templates & items: read all, write admin-level
create policy templates_select on public.checklist_templates for select to authenticated using (true);
create policy templates_write on public.checklist_templates for all to authenticated
  using (public.is_admin_level()) with check (public.is_admin_level());
create policy items_select on public.checklist_items for select to authenticated using (true);
create policy items_write on public.checklist_items for all to authenticated
  using (public.is_admin_level()) with check (public.is_admin_level());

-- runs: upper managers see all, outlet users see their outlet
create policy runs_select on public.checklist_runs for select to authenticated
  using (public.is_upper() or outlet_id = public.my_outlet());
create policy runs_insert on public.checklist_runs for insert to authenticated
  with check (started_by = auth.uid() and (public.is_upper() or outlet_id = public.my_outlet()));
create policy runs_update on public.checklist_runs for update to authenticated
  using (public.is_upper() or (outlet_id = public.my_outlet() and started_by = auth.uid()));

-- responses follow their run's visibility
create policy responses_select on public.checklist_responses for select to authenticated
  using (exists (
    select 1 from public.checklist_runs r
    where r.id = run_id and (public.is_upper() or r.outlet_id = public.my_outlet())
  ));
create policy responses_write on public.checklist_responses for all to authenticated
  using (exists (
    select 1 from public.checklist_runs r
    where r.id = run_id and r.status = 'in_progress'
      and (public.is_upper() or r.outlet_id = public.my_outlet())
  ))
  with check (exists (
    select 1 from public.checklist_runs r
    where r.id = run_id and r.status = 'in_progress'
      and (public.is_upper() or r.outlet_id = public.my_outlet())
  ));

-- SOPs & training content: read all, write admin-level or hr
create policy sops_select on public.sops for select to authenticated using (true);
create policy sops_write on public.sops for all to authenticated
  using (public.is_admin_level()) with check (public.is_admin_level());
create policy sop_steps_select on public.sop_steps for select to authenticated using (true);
create policy sop_steps_write on public.sop_steps for all to authenticated
  using (public.is_admin_level()) with check (public.is_admin_level());

create policy tm_select on public.training_modules for select to authenticated using (true);
create policy tm_write on public.training_modules for all to authenticated
  using (public.is_admin_level() or public.my_role() = 'hr')
  with check (public.is_admin_level() or public.my_role() = 'hr');
create policy tl_select on public.training_lessons for select to authenticated using (true);
create policy tl_write on public.training_lessons for all to authenticated
  using (public.is_admin_level() or public.my_role() = 'hr')
  with check (public.is_admin_level() or public.my_role() = 'hr');

-- training/onboarding progress: own rows + managers can view/verify
create policy tp_select on public.training_progress for select to authenticated
  using (user_id = auth.uid() or public.is_upper() or public.is_outlet_manager());
create policy tp_insert on public.training_progress for insert to authenticated
  with check (user_id = auth.uid());
create policy tp_update on public.training_progress for update to authenticated
  using (public.is_upper() or public.is_outlet_manager());

create policy ot_select on public.onboarding_tasks for select to authenticated using (true);
create policy ot_write on public.onboarding_tasks for all to authenticated
  using (public.is_admin_level() or public.my_role() = 'hr')
  with check (public.is_admin_level() or public.my_role() = 'hr');

create policy op_select on public.onboarding_progress for select to authenticated
  using (user_id = auth.uid() or public.is_upper() or public.is_outlet_manager());
create policy op_insert on public.onboarding_progress for insert to authenticated
  with check (user_id = auth.uid());
create policy op_update on public.onboarding_progress for update to authenticated
  using (public.is_upper() or public.is_outlet_manager());

-- violations (fines): audit exec / admin create; visibility scoped;
-- appeal by the fined outlet's managers or the fined staff member; decision by HR/admin
create policy v_select on public.violations for select to authenticated
  using (public.is_upper() or outlet_id = public.my_outlet() or staff_id = auth.uid());
create policy v_insert on public.violations for insert to authenticated
  with check (public.my_role() in ('audit_executive', 'admin', 'ceo', 'operations_manager')
              and reported_by = auth.uid());
create policy v_update on public.violations for update to authenticated
  using (
    public.my_role() in ('hr', 'admin', 'ceo')
    or (status = 'issued' and (staff_id = auth.uid() or (public.is_outlet_manager() and outlet_id = public.my_outlet())))
  );

-- alerts: upper managers see all, outlet users see their outlet's
create policy a_select on public.alerts for select to authenticated
  using (public.is_upper() or outlet_id = public.my_outlet());
create policy a_insert on public.alerts for insert to authenticated with check (true);
create policy a_update on public.alerts for update to authenticated
  using (public.is_upper() or (public.is_outlet_manager() and outlet_id = public.my_outlet()));

-- ---------- Storage buckets ----------
insert into storage.buckets (id, name, public) values
  ('evidence', 'evidence', true),
  ('sop-media', 'sop-media', true)
on conflict (id) do nothing;

create policy storage_read on storage.objects for select to public
  using (bucket_id in ('evidence', 'sop-media'));
create policy storage_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('evidence', 'sop-media'));
