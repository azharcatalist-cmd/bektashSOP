export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <img src="/logo.svg" alt="bektash" className="mb-8 h-14" />
      <h1 className="text-2xl font-bold text-brand-yellow">Almost there — connect Supabase</h1>
      <p className="mt-3 text-zinc-300">
        The app isn&apos;t configured yet. Follow these steps once and this screen disappears:
      </p>
      <ol className="mt-6 list-decimal space-y-4 pl-5 text-zinc-200">
        <li>
          Create a free project at{" "}
          <span className="font-mono text-brand-yellow">supabase.com</span>.
        </li>
        <li>
          In the Supabase <strong>SQL Editor</strong>, run{" "}
          <span className="font-mono">supabase/schema.sql</span> from this repository, then{" "}
          <span className="font-mono">supabase/seed.sql</span>.
        </li>
        <li>
          Copy <span className="font-mono">.env.example</span> to{" "}
          <span className="font-mono">.env.local</span> and fill in your project URL and anon key
          (Project Settings → API).
        </li>
        <li>Restart the app (or redeploy on Vercel with the env vars set).</li>
        <li>
          Sign up with your email, then promote yourself to admin in the SQL editor:
          <pre className="mt-2 overflow-x-auto rounded-xl bg-brand-card p-3 text-xs text-zinc-300">
            {`update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');`}
          </pre>
        </li>
      </ol>
      <p className="mt-8 text-sm text-zinc-500">
        Full instructions are in the README. Bektash Ops — Rapos Hospitality Pvt Ltd.
      </p>
    </main>
  );
}
