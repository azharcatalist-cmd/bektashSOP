import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bektash — Shawarma · Grill · Burger · Kochi",
  description:
    "Kochi's shawarma & grill house. Spit-loaded every morning, flame-finished all day — shawarma, al faham, burgers and shakes across four outlets in Kochi.",
};

const OUTLETS = [
  {
    name: "Bektash Marad",
    code: "MRD",
    address: "Marad, Kochi, Kerala",
    maps: "https://www.google.com/maps/search/?api=1&query=Bektash+Marad+Kochi",
  },
  {
    name: "Bektash Nettoor",
    code: "NTR",
    address: "Intuc Junction, NH Bypass, Nettoor, Kochi",
    maps: "https://www.google.com/maps/search/?api=1&query=Bektash+Nettoor+Kochi",
  },
  {
    name: "Bektash Kakkanad",
    code: "KKD",
    address: "Kakkanad, Kochi, Kerala",
    maps: "https://www.google.com/maps/search/?api=1&query=Bektash+Kakkanad+Kochi",
  },
  {
    name: "Bektash MG Road",
    code: "MGR",
    address: "MG Road, Kochi, Kerala",
    maps: "https://www.google.com/maps/search/?api=1&query=Bektash+MG+Road+Kochi",
  },
];

const MENU = [
  {
    title: "Shawarma",
    tag: "The signature",
    description:
      "Marinated overnight, layered on the spit every morning, carved hot through the day. Wrapped in fresh kuboos or rolled — plate it or take it walking.",
    icon: SkewerIcon,
  },
  {
    title: "Al Faham",
    tag: "Off the charcoal",
    description:
      "Arabian-style grilled chicken, spice-rubbed and finished over live charcoal for that deep smoke you can't fake. Served with kuboos, salad and garlic mayo.",
    icon: FlameIcon,
  },
  {
    title: "Burgers & Grills",
    tag: "Flame-finished",
    description:
      "Juicy grilled patties, toasted buns, loaded sauces — plus grilled platters for when one sandwich was never going to be enough.",
    icon: BurgerIcon,
  },
  {
    title: "Shakes & Coolers",
    tag: "The cold side",
    description:
      "Thick shakes and fresh coolers made to order — the only correct way to follow fire and spice.",
    icon: ShakeIcon,
  },
];

const STANDARDS = [
  {
    stat: "15",
    unit: "checks",
    label: "Opening checklist, photographed and signed off in every outlet, every morning",
  },
  {
    stat: "13",
    unit: "checks",
    label: "Closing checklist every night — equipment off, food stored, labelled and dated",
  },
  {
    stat: "1×",
    unit: "monthly",
    label: "Full scored audit of every outlet by our operations team, reported to the top",
  },
  {
    stat: "100%",
    unit: "trained",
    label: "Every team member completes food safety & hygiene training before a solo shift",
  },
];

export default function HomePage() {
  return (
    <div className="landing min-h-dvh overflow-x-clip bg-brand-black text-zinc-100">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
      />

      <Nav />
      <Hero />
      <Ticker />
      <MenuSection />
      <StandardSection />
      <LocationsSection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-brand-black/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="font-display text-2xl uppercase tracking-wide text-brand-yellow">
          Bektash
        </a>
        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-300 md:flex">
          <a href="#menu" className="transition-colors hover:text-brand-yellow">
            The food
          </a>
          <a href="#standard" className="transition-colors hover:text-brand-yellow">
            The standard
          </a>
          <a href="#locations" className="transition-colors hover:text-brand-yellow">
            Locations
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300 sm:block"
          >
            Team login
          </Link>
          <a
            href="#locations"
            className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-black transition-colors hover:bg-brand-amber"
          >
            Find us
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* amber glow + embers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 32rem at 50% 118%, rgba(255,198,11,0.22), rgba(255,120,0,0.08) 45%, transparent 70%), radial-gradient(40rem 20rem at 85% -10%, rgba(255,198,11,0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 select-none overflow-hidden text-center font-display uppercase leading-none text-white/[0.025]"
        style={{ fontSize: "clamp(6rem, 22vw, 20rem)" }}
      >
        Bektash
      </div>

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center px-5 pb-24 pt-32 text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
          <FlameGlyph className="h-3.5 w-3.5" />
          Shawarma · Grill · Burger — Kochi
        </p>
        <h1 className="font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          Real fire.
          <br />
          <span className="text-brand-yellow">Real flavour.</span>
        </h1>
        <p className="mt-7 max-w-xl text-balance text-base text-zinc-400 sm:text-lg">
          Bektash is Kochi&apos;s shawarma &amp; grill house. The spit is loaded fresh every
          morning, the charcoal stays live all day, and every plate leaves a kitchen that gets
          audited like it matters — because it does.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#menu"
            className="rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-black transition-colors hover:bg-brand-amber"
          >
            See the food
          </a>
          <a
            href="#locations"
            className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:border-brand-yellow/60 hover:text-brand-yellow"
          >
            4 outlets in Kochi
          </a>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const words = ["Shawarma", "Al Faham", "Grill", "Burgers", "Shakes", "Kochi"];
  const row = words.map((w, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6">
      {w}
      <span className="text-brand-yellow">✦</span>
    </span>
  ));
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-white/5 bg-brand-surface py-4 font-display text-2xl uppercase tracking-wide text-zinc-500"
    >
      <div className="ticker-track flex w-max whitespace-nowrap">
        <div>{row}</div>
        <div>{row}</div>
      </div>
    </div>
  );
}

function MenuSection() {
  return (
    <section id="menu" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionHeading
        eyebrow="The food"
        title="What we're famous for"
        lede="No shortcuts anywhere on this menu — overnight marinades, live charcoal, and everything carved, grilled or blended when you order it."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {MENU.map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-brand-card p-8 transition-colors hover:border-brand-yellow/40"
          >
            <div
              aria-hidden
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/5 blur-2xl transition-opacity opacity-0 group-hover:opacity-100"
            />
            <item.icon className="h-10 w-10 text-brand-yellow" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow/80">
              {item.tag}
            </p>
            <h3 className="mt-1 font-display text-3xl uppercase tracking-wide">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StandardSection() {
  return (
    <section id="standard" className="scroll-mt-24 border-y border-white/5 bg-brand-surface">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <SectionHeading
          eyebrow="The standard"
          title="Most places promise standards. We audit ours."
          lede="Every Bektash outlet runs on the same operating system: photographed daily checklists, step-by-step SOPs for every dish, scored monthly audits and mandatory hygiene training. It's how outlet number four tastes exactly like outlet number one."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-white/5 bg-brand-black p-7"
            >
              <p className="font-display text-5xl text-brand-yellow">
                {s.stat}
                <span className="ml-2 align-middle text-sm font-sans font-semibold uppercase tracking-widest text-zinc-500">
                  {s.unit}
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationsSection() {
  return (
    <section id="locations" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionHeading
        eyebrow="Locations"
        title="Four fires across Kochi"
        lede="Same spit, same charcoal, same standard — pick whichever is closest."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {OUTLETS.map((o) => (
          <a
            key={o.code}
            href={o.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-4 rounded-3xl border border-white/5 bg-brand-card p-7 transition-colors hover:border-brand-yellow/40"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow/80">
                {o.code}
              </p>
              <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">{o.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{o.address}</p>
            </div>
            <span
              aria-hidden
              className="mt-1 shrink-0 rounded-full border border-white/10 p-2.5 text-zinc-500 transition-colors group-hover:border-brand-yellow/60 group-hover:text-brand-yellow"
            >
              <PinIcon className="h-4 w-4" />
            </span>
          </a>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Tap an outlet to open it in Google Maps.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="border-t border-white/5 bg-brand-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-3xl uppercase tracking-wide text-brand-yellow">
              Bektash
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Shawarma · Grill · Burger · Kochi
              <br />A Rapos Hospitality Pvt Ltd brand.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Outlets
              </p>
              <ul className="space-y-2 text-zinc-400">
                {OUTLETS.map((o) => (
                  <li key={o.code}>
                    <a
                      href={o.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-brand-yellow"
                    >
                      {o.name.replace("Bektash ", "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Company
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="#standard" className="transition-colors hover:text-brand-yellow">
                    The Bektash standard
                  </a>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-brand-yellow">
                    Team login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-white/5 pt-6 text-xs text-zinc-600">
          © {new Date().getFullYear()} Rapos Hospitality Pvt Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-yellow">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{lede}</p>
    </div>
  );
}

/* ---------- inline icons ---------- */

type IconProps = { className?: string };

function FlameGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c1 4-4 6-4 11a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 3.5 4 6.5A7 7 0 0 1 5 14.5C5 8.5 11 7 12 2Z" />
    </svg>
  );
}

function SkewerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <line x1="20" y1="3" x2="20" y2="37" strokeLinecap="round" />
      <path d="M13 9h14l-1.5 5h-11L13 9Z" strokeLinejoin="round" />
      <path d="M12 17h16l-2 6H14l-2-6Z" strokeLinejoin="round" />
      <path d="M14 26h12l-1.5 5h-9L14 26Z" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path
        d="M20 4c2 7-7 10-7 19a7 7 0 0 0 14 0c0-3.5-2-5.5-2-9 3.5 2 7 6 7 11A12 12 0 0 1 8 25C8 14.5 18.5 12.5 20 4Z"
        strokeLinejoin="round"
      />
      <path d="M20 22c1 2.5-2 3.5-2 6a2.5 2.5 0 0 0 5 0c0-2.5-2-3.5-3-6Z" strokeLinejoin="round" />
    </svg>
  );
}

function BurgerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M8 16a12 8 0 0 1 24 0H8Z" strokeLinejoin="round" />
      <line x1="7" y1="21" x2="33" y2="21" strokeLinecap="round" />
      <path d="M8 26h24v2a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5v-2Z" strokeLinejoin="round" />
      <circle cx="15" cy="11" r="0.5" fill="currentColor" />
      <circle cx="21" cy="9.5" r="0.5" fill="currentColor" />
      <circle cx="26" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ShakeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M12 12h16l-2.5 24h-11L12 12Z" strokeLinejoin="round" />
      <line x1="10" y1="8" x2="30" y2="8" strokeLinecap="round" />
      <line x1="22" y1="8" x2="26" y2="2" strokeLinecap="round" />
      <line x1="14" y1="19" x2="26" y2="19" />
    </svg>
  );
}

function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
