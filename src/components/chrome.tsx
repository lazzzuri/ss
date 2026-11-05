import Link from "next/link";
import type { Lang } from "@/content/types";
import { BRAND } from "@/config/site";
import type { Settings } from "@/config/site";
import { t } from "@/i18n/dict";
import { href } from "@/i18n/routes";
import { catalogOf } from "@/content/catalog";
import { LangSwitch } from "./lang-switch";

export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="city" src="/skyline.svg" alt="" />
      <div className="haze" />
    </div>
  );
}

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5fd0d8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7c97ff" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="7" fill="url(#lg-glass)" stroke="#f1f6fa" strokeOpacity="0.8" strokeWidth="1.4" />
      <path d="M16 3.8V28.2M3.8 13H28.2" stroke="#f1f6fa" strokeOpacity="0.85" strokeWidth="1.4" />
      <path d="M7.5 9.5l3-3M20 9.5l3-3" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="25" cy="24" r="2.2" fill="#ffc94d" />
    </svg>
  );
}

function navItems(lang: Lang) {
  const d = t(lang).nav;
  return [
    { path: "/poslugy", label: d.services },
    { path: "/rayony", label: d.districts },
    { path: "/budynky", label: d.buildings },
    { path: "/tsiny", label: d.prices },
    { path: "/blog", label: d.blog },
    { path: "/maistram", label: d.masters },
  ];
}

export function Header({ lang, settings }: { lang: Lang; settings: Settings }) {
  const d = t(lang);
  const items = navItems(lang);
  const tel = settings.phone.replace(/[^\d+]/g, "");
  return (
    <header className="site-header">
      <a className="skip" href="#main">
        {lang === "uk" ? "До змісту" : "К содержанию"}
      </a>
      <div className="wrap">
        <div className="header-bar glass">
          <Link className="logo" href={href(lang)} aria-label={BRAND[lang]}>
            <LogoMark />
            <span>{BRAND[lang].toLowerCase()}</span>
          </Link>
          <nav className="nav" aria-label={d.nav.menu}>
            {items.map((it) => (
              <Link key={it.path} href={href(lang, it.path)}>
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            {settings.phone ? (
              <a className="header-phone" href={`tel:${tel}`}>
                {settings.phone}
              </a>
            ) : null}
            <LangSwitch lang={lang} />
            <Link className="btn btn-amber header-cta" href={`${href(lang)}#calc`}>
              {d.cta.calc}
            </Link>
            <details className="menu">
              <summary>{d.nav.menu}</summary>
              <div className="menu-panel glass">
                {items.map((it) => (
                  <Link key={it.path} href={href(lang, it.path)}>
                    {it.label}
                  </Link>
                ))}
                <Link href={href(lang, "/yak-tse-pratsyuie")}>{d.nav.how}</Link>
                <Link className="btn btn-amber" href={`${href(lang)}#calc`}>
                  {d.cta.calc}
                </Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ lang, settings }: { lang: Lang; settings: Settings }) {
  const d = t(lang);
  const tel = settings.phone.replace(/[^\d+]/g, "");
  const col = (kind: "service" | "district" | "building") =>
    catalogOf(kind).map((e) => (
      <li key={e.slug}>
        <Link href={href(lang, `/${kind === "service" ? "poslugy" : kind === "district" ? "rayony" : "budynky"}/${e.slug}`)}>{e.name[lang]}</Link>
      </li>
    ));
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-inner glass">
          <div className="footer-cols">
            <div>
              <h4>{d.footer.services}</h4>
              <ul>{col("service")}</ul>
            </div>
            <div>
              <h4>{d.footer.districts}</h4>
              <ul>{col("district")}</ul>
            </div>
            <div>
              <h4>{d.footer.buildings}</h4>
              <ul>{col("building")}</ul>
            </div>
            <div>
              <h4>{d.footer.info}</h4>
              <ul>
                <li><Link href={href(lang, "/tsiny")}>{d.nav.prices}</Link></li>
                <li><Link href={href(lang, "/yak-tse-pratsyuie")}>{d.nav.how}</Link></li>
                <li><Link href={href(lang, "/blog")}>{d.nav.blog}</Link></li>
                <li><Link href={href(lang, "/maistram")}>{d.nav.masters}</Link></li>
                <li><Link href={href(lang, "/polityka-konfidentsiinosti")}>{d.footer.privacy}</Link></li>
              </ul>
              {(settings.phone || settings.telegram || settings.viber || settings.email) && (
                <>
                  <h4 style={{ marginTop: 20 }}>{d.footer.contacts}</h4>
                  <ul>
                    {settings.phone && <li><a href={`tel:${tel}`} className="mono">{settings.phone}</a></li>}
                    {settings.telegram && <li><a href={`https://t.me/${settings.telegram.replace(/^@/, "")}`} rel="noopener" target="_blank">Telegram @{settings.telegram.replace(/^@/, "")}</a></li>}
                    {settings.viber && <li><span className="mono">Viber {settings.viber}</span></li>}
                    {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="footer-bottom">
            <p>{d.footer.disclosure}</p>
            <span>© {new Date().getFullYear()} {BRAND[lang]}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MobileBar({ lang, settings }: { lang: Lang; settings: Settings }) {
  const d = t(lang);
  const tel = settings.phone.replace(/[^\d+]/g, "");
  return (
    <div className="mobile-bar" role="navigation" aria-label={d.cta.calc}>
      <a className="btn btn-amber" href={`${href(lang)}#calc`} data-track="mobile-bar-calc">{d.cta.calc}</a>
      {tel ? (
        <a className="btn btn-glass" href={`tel:${tel}`} data-track="mobile-bar-call" aria-label={settings.phone}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
          {lang === "uk" ? "Подзвонити" : "Позвонить"}
        </a>
      ) : (
        <a className="btn btn-glass" href={href(lang, "/poslugy/remont-vikon")} data-track="mobile-bar-repair">{d.cta.repair}</a>
      )}
    </div>
  );
}
