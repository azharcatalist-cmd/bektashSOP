# Bektash Ops

**The operations platform for Bektash outlets** — daily checklists with photo evidence, SOPs,
audits, fines & appeals, alerts, training, onboarding and management reports.
Built for **Rapos Hospitality Pvt Ltd**.

> 📱 It's a PWA: open the app URL on any phone → browser menu → **Add to Home Screen** →
> it installs and behaves like a native app, with camera access for photo evidence.

---

## What it does

| Module | What happens there | Who uses it |
|---|---|---|
| **Checklists** | Daily opening (15 items) & closing (13 items) with photo evidence, auto-scored; Area Manager weekly visit; Operations Manager monthly scored audit | Outlet team → AM → OM |
| **SOPs** | Step-by-step standards with photos/videos: shawarma, al faham, burgers, shakes, cleaning, customer service | Everyone |
| **Fines & appeals** | Audit Executive files violations (photo + CCTV reference + amount) → auto-forwarded to HR → fined party appeals in-app → HR upholds or cancels → upheld fines marked paid | Audit Exec, HR, everyone affected |
| **Alerts** | Auto-raised on critical checklist failures, scores below 80%, and every fine filed; managers resolve them | Managers |
| **Training** | Modules with lessons (Food Safety & Hygiene, FOH Service, BOH Kitchen, Compliance & Audits); completion tracked per person | Everyone |
| **Onboarding** | Department-specific task lists for new joiners (documents, FSSAI medical certificate, uniform, station inductions) with manager verification | New staff + their manager |
| **Reports** | Per-outlet compliance scores, fines totals, open alerts, training completion — last 30 days | Store Manager and above |
| **Admin** | Users/roles/access, outlets, checklist template editor, SOP editor | Admin, CEO, Ops Manager |

## The hierarchy

```
CEO / Admin
 └─ Operations Manager        (monthly audits, admin panel, all reports)
     └─ Area Manager          (weekly outlet visits, cross-outlet reports)
         └─ Store Manager     (one outlet: daily checklists, team verification)
             └─ Shift Manager
                 └─ Staff     (FOH / BOH)

Audit Executive  — independent: inspects anything, files violations & fines
HR               — receives fines, decides appeals, manages people records
```

Access control is enforced by **Postgres Row Level Security** in the database itself —
staff see only their outlet, only HR/admin can decide appeals, only audit roles can file
fines. Even a modified client cannot bypass it.

## How a normal day works

1. **Morning** — shift/store manager opens the app, runs the *Opening Checklist*, photographing
   the items marked 📷 (grooming, chiller temperature, loaded spit, storefront…). Critical
   items marked 🔴 raise an alert instantly if reported as an issue.
2. **Night** — same with the *Closing Checklist* (equipment off, food stored & labelled, cash
   reconciled, gas closed).
3. **Weekly** — the Area Manager visits each outlet with the weekly inspection checklist.
4. **Monthly** — the Operations Manager runs the scored audit; the CEO tracks everything on
   the Reports page.
5. **Anytime** — the Audit Executive inspects (including CCTV review) and files violations;
   fines flow to HR; appeals are decided in-app.

## New staff flow

1. Staff member signs up in the app (starts as *Staff* with no sensitive access).
2. Manager/HR assigns outlet, department (FOH/BOH/Outlet Ops) and role in **Admin → Users**.
3. They work through **Onboarding** (manager verifies each verification-required task) and the
   two required **Training** modules before their first solo shift.

---

## Tech stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS — installable PWA with offline shell
- **Supabase** — Postgres (with RLS), Auth, Storage (photo/video evidence)
- **Vercel** — hosting & CI: every push to the production branch auto-deploys
- **GitHub** — source of truth and full version history

### Project structure

```
supabase/schema.sql        database schema + security policies (also applied as a migration)
supabase/seed.sql          Bektash content: outlets, checklists, SOPs, training, onboarding
src/middleware.ts          session refresh + auth redirects
src/lib/                   supabase clients, auth helper, role definitions, formatting
src/app/page.tsx           public brand website at / (bektash.in) — no login required
src/app/login              sign in / staff sign up
src/app/(app)/             the app itself (requires login):
  dashboard/               role-aware home
  checklists/              start, fill (photo per item), submit, history
  sops/                    SOP library + step viewer
  training/                modules, lessons, completion
  onboarding/              task list + manager verification
  fines/                   list, file (audit roles), appeal, HR decisions
  alerts/                  open/resolved non-compliance alerts
  reports/                 stats, per-outlet scorecard
  admin/                   users, outlets, checklist templates, SOP editor
public/                    logo, PWA manifest, service worker, icons
```

## Running locally (developers)

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

The production Supabase config also lives in `.env.production` (the anon key is a
public-by-design key; all real security is in Row Level Security policies).

## Versioning, releases & rollback

- **Every commit is a version.** Full history on GitHub; nothing is ever lost.
- **Every deployment is kept.** Vercel → project → *Deployments* → any older deployment →
  **Promote to Production** = instant rollback, one button, no code.
- **Database changes** are applied as named Supabase migrations, so schema history is
  traceable independently of app versions.
- **Convention:** production branch = what's live; feature work on side branches (each gets a
  free Vercel preview URL to test on a phone before merging). Milestones are tagged
  `v1.0.0`, `v1.1.0`, …

## Operating guide (admins)

| Task | Where |
|---|---|
| Give a new signup their role/outlet | Admin → Users & access |
| Add or rename an outlet | Admin → Outlets |
| Change checklist items (add photo/critical flags) | Admin → Checklist templates |
| Write a new SOP with photos/videos | Admin → SOPs |
| Decide a fine appeal | Fines (as HR/CEO) |
| See who hasn't finished training | Reports |
| Disable a leaver's access | Admin → Users → untick *Active* |

## Roadmap

- [ ] Missed-checklist auto-alerts (scheduled job: "outlet X didn't submit opening by 11:00")
- [ ] WhatsApp notifications for fines, alerts and appeal decisions
- [ ] Live-camera-only photo capture with time/outlet stamp (anti-cheat)
- [ ] Pass/fail quizzes on training modules
- [ ] Temperature log module with trend charts
- [ ] Monthly fines export for payroll
- [ ] Malayalam language toggle for staff screens
- [ ] Outlet compliance leaderboard

## Notes

- `public/logo.svg` and `public/icons/*` are **placeholders** — replace with the official
  Bektash logo files (same filenames) and everything updates.
- Demo accounts created during setup should be **deleted before real rollout**
  (Admin → Users → untick Active, or remove them in Supabase → Authentication).

---

**Bektash** — Shawarma · Grill · Burger · Kochi
A Rapos Hospitality Pvt Ltd brand · [bektash.in](https://bektash.in)
