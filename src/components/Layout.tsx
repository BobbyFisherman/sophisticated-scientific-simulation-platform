import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Orbit, Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";

const SCIENCE_LINKS = [
  { to: "/science/habitable-zones", label: "The Habitable Zone", sub: "Kopparapu boundaries" },
  { to: "/science/temperature", label: "Energy & Temperature", sub: "Stellar flux → climate" },
  { to: "/science/atmospheres", label: "Atmospheric Escape", sub: "Keeping an atmosphere" },
  { to: "/science/similarity", label: "Similarity Metrics", sub: "ESI & habitability index" },
];

const NAV = [
  { to: "/observatory", label: "Observatory" },
  { to: "/simulation", label: "Simulation" },
  { to: "/method", label: "Method" },
  { to: "/worlds", label: "Worlds" },
  { to: "/data", label: "Data" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); }, [loc.pathname]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="grain min-h-screen bg-ink text-bone">
      {/* ------------------------------------------------ nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-ink/85 backdrop-blur-md border-b border-line" : "border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-[70px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="relative grid place-items-center w-8 h-8 rounded-full border border-amber/40 text-amber group-hover:rotate-45 transition-transform duration-700">
              <Orbit size={15} strokeWidth={1.5} />
            </span>
            <span className="font-display text-lg tracking-tight">Worldforge</span>
            <span className="hidden md:block text-[9px] font-mono uppercase tracking-[0.3em] text-faint mt-1">Habitability Engine</span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-[13px] text-mist">
            <div className="relative group">
              <button className="flex items-center gap-1.5 hover:text-bone transition-colors py-2">
                The Science <ChevronDown size={13} className="opacity-60" />
              </button>
              <div className="nav-drop absolute top-full left-1/2 -translate-x-1/2 pt-3">
                <div className="w-[300px] rounded-xl border border-line bg-abyss/95 backdrop-blur-md p-2 shadow-2xl shadow-black/60">
                  {SCIENCE_LINKS.map((l) => (
                    <NavLink key={l.to} to={l.to} className="block rounded-lg px-4 py-3 hover:bg-bone/5 transition-colors">
                      <div className="text-bone/90 text-[13px]">{l.label}</div>
                      <div className="text-[11px] text-faint mt-0.5">{l.sub}</div>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `u-sweep transition-colors ${isActive ? "text-bone" : "hover:text-bone"}`}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/observatory" className="ml-2 rounded-full border border-amber/50 text-amber px-5 py-2 text-[12.5px] hover:bg-amber hover:text-ink transition-all duration-300">
              Design a world
            </Link>
          </div>

          <button className="lg:hidden text-bone/80" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-line bg-ink/97 backdrop-blur-lg px-6 py-6 space-y-1 max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-faint pb-2">The Science</div>
            {SCIENCE_LINKS.map((l) => <NavLink key={l.to} to={l.to} className="block py-2.5 text-[15px] text-mist">{l.label}</NavLink>)}
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-faint pb-2 pt-4">The Engine</div>
            {[...NAV, { to: "/glossary", label: "Glossary" }, { to: "/about", label: "About" }].map((l) => (
              <NavLink key={l.to} to={l.to} className="block py-2.5 text-[15px] text-mist">{l.label}</NavLink>
            ))}
            <Link to="/observatory" className="mt-4 block text-center rounded-full border border-amber/50 text-amber px-5 py-3">Design a world</Link>
          </div>
        )}
      </nav>

      {/* ------------------------------------------------ content */}
      <main key={loc.pathname} className="page-enter">{children}</main>

      {/* ------------------------------------------------ footer */}
      <footer className="border-t border-line mt-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid place-items-center w-8 h-8 rounded-full border border-amber/40 text-amber"><Orbit size={15} strokeWidth={1.5} /></span>
              <span className="font-display text-lg">Worldforge</span>
            </div>
            <p className="text-[13px] text-faint leading-relaxed max-w-xs">
              An interactive exoplanet habitability engine built on published planetary science — from Kopparapu habitable-zone boundaries to Chen–Kipping mass–radius relations.
            </p>
            <p className="text-[11px] font-mono text-faint mt-6">Educational model · not an instrument of record</p>
          </div>
          <FooterCol title="The Science" links={[...SCIENCE_LINKS.map((l) => ({ to: l.to, label: l.label })), { to: "/method", label: "How the Engine Works" }]} />
          <FooterCol title="The Engine" links={[{ to: "/observatory", label: "The Observatory" }, { to: "/simulation", label: "Live Simulation" }, { to: "/worlds", label: "Known Worlds" }, { to: "/", label: "Home" }]} />
          <FooterCol title="Reference" links={[{ to: "/data", label: "Data & Sources" }, { to: "/glossary", label: "Glossary" }, { to: "/about", label: "About & Limitations" }]} />
        </div>
        <div className="border-t border-line-soft">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-faint">
            <span>WORLDFORGE — MMXXVI</span>
            <span className="flex items-center gap-1.5">Built on peer-reviewed astrophysics <ArrowUpRight size={12} /></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="md:col-span-2 md:col-start-auto">
      <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-faint mb-5">{title}</div>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="text-[13px] text-mist hover:text-bone transition-colors u-sweep">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
