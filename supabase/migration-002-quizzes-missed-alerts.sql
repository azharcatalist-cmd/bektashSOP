-- ============================================================
-- Migration 002: training quizzes + missed-checklist auto-alerts
-- (Already applied to the live project; kept here for history.)
-- ============================================================

-- ---------- Training quizzes ----------
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules (id) on delete cascade,
  position int not null default 0,
  question text not null,
  options jsonb not null, -- array of option strings
  correct_index int not null
);

alter table public.quiz_questions enable row level security;
create policy qq_select on public.quiz_questions for select to authenticated using (true);
create policy qq_write on public.quiz_questions for all to authenticated
  using (public.is_admin_level() or public.my_role() = 'hr')
  with check (public.is_admin_level() or public.my_role() = 'hr');

-- ---------- Missed-checklist auto-alerts ----------
create extension if not exists pg_cron;

create or replace function public.raise_missed_checklist_alerts(p_type template_type)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  target_date date;
begin
  target_date := (now() at time zone 'Asia/Kolkata')::date;
  if p_type = 'closing' then
    target_date := target_date - 1; -- closing is checked shortly after midnight IST
  end if;

  insert into public.alerts (outlet_id, severity, title, message, source)
  select o.id,
         'critical',
         'Missed ' || p_type || ' checklist',
         o.name || ' did not submit the ' || t.name || ' for '
           || to_char(target_date, 'DD Mon YYYY') || '.',
         'system'
  from public.outlets o
  cross join public.checklist_templates t
  where o.active
    and t.active
    and t.type = p_type
    and not exists (
      select 1 from public.checklist_runs r
      where r.outlet_id = o.id
        and r.template_id = t.id
        and r.run_date = target_date
        and r.status <> 'in_progress'
    )
    and not exists ( -- don't duplicate the alert for the same outlet+day
      select 1 from public.alerts a
      where a.outlet_id = o.id
        and a.source = 'system'
        and a.title = 'Missed ' || p_type || ' checklist'
        and a.message like '%' || to_char(target_date, 'DD Mon YYYY') || '%'
    );
end;
$$;

-- Opening check at 06:00 UTC = 11:30 IST; closing check at 19:30 UTC = 01:00 IST next day
select cron.schedule('missed-opening-checklists', '0 6 * * *',
  $$select public.raise_missed_checklist_alerts('opening')$$);
select cron.schedule('missed-closing-checklists', '30 19 * * *',
  $$select public.raise_missed_checklist_alerts('closing')$$);
