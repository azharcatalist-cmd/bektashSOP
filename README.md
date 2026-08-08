# Bektash Ops — Operations Platform

Operations platform for **Bektash** (Rapos Hospitality Pvt Ltd): daily checklists with photo
evidence, SOPs with photos & videos, area-manager and operations-manager audits, a fines &
appeals workflow, non-compliance alerts, training, onboarding, reports and an admin panel.

Built as a **PWA** — staff install it on their phones from the browser (Add to Home Screen)
and get camera access for photo evidence. One codebase for web + mobile.

## Modules

| # | Module | Who uses it |
|---|--------|-------------|
| 1 | Opening & closing checklists with photo evidence | Outlet team (shift/store manager) |
| 2 | Weekly outlet visit checklist | Area Manager |
| 3 | Monthly scored audit | Operations Manager |
| 4 | SOPs with steps, photos and videos | Everyone |
| 5 | Admin panel (users, roles, outlets, templates, SOPs) | Admin / CEO / Ops Manager |
| 6 | Role-based login & hierarchy | Everyone |
| 7 | Reports (compliance scores, fines, alerts, training) | Store manager and above |
| 8 | Non-compliance alerts (critical failures, low scores, fines) | Managers |
| 9 | Training modules with progress tracking | Everyone |
| 10 | Department-based onboarding with manager verification | New joiners + managers |

### Roles

`staff` → `shift_manager` → `store_manager` → `area_manager` → `operations_manager` → `ceo` / `admin`,
plus `audit_executive` (files violations & fines, with CCTV references and photo evidence) and
`hr` (receives fines, reviews appeals, upholds or cancels).

### Fines workflow

Audit Executive files violation (evidence + amount) → automatically with **HR** →
outlet manager or the fined staff member can **appeal** in-app → HR **upholds** or
**cancels** → upheld fines can be marked **paid/recovered**. Every step is visible to
upper management, and an alert is raised when a fine is filed.

## Setup (one time, ~15 minutes)

### 1. Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Then run [`supabase/seed.sql`](supabase/seed.sql) — this loads the Bektash outlets,
   opening/closing/weekly/audit checklists, SOPs (shawarma, al faham, burgers, shakes,
   cleaning, service), training modules and onboarding tasks. Edit names to taste.
4. (Recommended) In **Authentication → Providers → Email**, decide whether to require
   email confirmation. For fastest staff onboarding, turn confirmation **off**.

### 2. Environment

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from Supabase → Project Settings → API
```

### 3. Run

```bash
npm install
npm run dev        # http://localhost:3000
```

### 4. Create the first admin

Sign up in the app with your email, then in the Supabase SQL editor:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@raposventures.com');
```

From then on you assign everyone's role/outlet/department from **Admin → Users & access**
inside the app — no SQL needed again.

### 5. Deploy (Vercel, free tier works)

1. Push this repo to GitHub (done) and import it at [vercel.com](https://vercel.com).
2. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.
3. Deploy. Share the URL with staff — on their phone they open it and use
   **Add to Home Screen** to install it like an app.

## Staff flow (day one)

1. Staff member signs up with email + password (starts as `staff`, no access to anything sensitive).
2. Manager/HR assigns their outlet, department (FOH/BOH/Outlet Ops) and role in Admin → Users.
3. They complete **Onboarding** tasks (documents, medical certificate, uniform, tour —
   manager verifies each) and the two required **Training** modules (Food Safety & Hygiene,
   Compliance & Audit System).
4. Daily: shift/store manager runs the opening & closing checklists with photo evidence.
5. Weekly: area manager completes the visit checklist per outlet.
6. Monthly: operations manager runs the scored audit; CEO watches the Reports page.

## Branding

`public/logo.svg` and `public/icons/*.svg` are **placeholders** drawn in the brand
yellow/black. Replace them with the official Bektash logo files (the ones you have from
your designer) — keep the same file names and everything updates. For best PWA install
quality, also add PNG icons (192×192 and 512×512) and reference them in
`public/manifest.webmanifest`.

## Tech

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Row Level Security, Auth, Storage (photo/video evidence)
- PWA: web manifest + service worker (offline shell, installable)

### Things to know

- **Row Level Security** enforces the hierarchy at the database level — staff only see
  their outlet; upper managers see everything; only HR/admin can decide appeals; only the
  audit roles can file fines. Even a modified client can't bypass it.
- **Missed-checklist detection**: the Reports page shows submissions per outlet per day.
  If you want automatic "outlet X didn't submit opening checklist by 11:00" alerts, add a
  Supabase scheduled Edge Function (cron) that inserts into `alerts` — schema already
  supports it (`source = 'system'`).
- Native iOS/Android apps can be added later against the same Supabase backend without
  any schema changes.
