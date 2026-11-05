import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { pricesPage } from "@/content/pages";
import { catalogOf } from "@/content/catalog";
import { TextPage } from "@/components/text-page";
import { Calculator } from "@/components/forms";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { t, fill } from "@/i18n/dict";
import { formatMoney } from "@/lib/calc";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta({ lang, path: "/tsiny", title: pricesPage[lang].title, description: pricesPage[lang].description });
}

export default async function Page({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const s = await getSettings();
  const districts = catalogOf("district").map((x) => ({ slug: x.slug, name: x.name[lang] }));
  const tables = (
    <div className="stack">
      <div className="split">
        <div className="table-wrap glass">
          <table className="prices">
            <thead><tr><th>{d.prices.profilesTitle}</th><th>{d.prices.perM2}</th></tr></thead>
            <tbody>
              {(["econom", "standard", "energy"] as const).map((p) => (
                <tr key={p}>
                  <td><b>{d.calc.profiles[p].name}</b><br /><span className="muted" style={{ fontSize: 13.5 }}>{d.calc.profiles[p].note}</span></td>
                  <td className="num">{lang === "uk" ? "від" : "от"} {formatMoney(s.prices[p], lang)}</td>
                </tr>
              ))}
              <tr><td colSpan={2} className="muted" style={{ fontSize: 13.5 }}>{fill(d.prices.installNote, { pct: Math.round(s.installShare * 100) })}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="table-wrap glass">
          <table className="prices">
            <thead><tr><th>{d.prices.extrasTitle}</th><th>₴</th></tr></thead>
            <tbody>
              {(["removal", "sill", "drip", "net"] as const).map((x) => (
                <tr key={x}><td>{d.calc.extraNames[x]}</td><td className="num">{formatMoney(s.extras[x], lang)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="table-wrap glass">
        <table className="prices">
          <thead><tr><th>{d.prices.repairTitle}</th><th>{d.prices.col.price}</th></tr></thead>
          <tbody>
            {s.repairPrices.map((r, i) => (
              <tr key={i}><td>{r.name[lang]}</td><td className="num">{r.price[lang]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  return (
    <TextPage lang={lang} path="/tsiny" text={pricesPage[lang]} before={tables}>
      <Calculator lang={lang} service="zamina-vikon" settings={s} districts={districts} phone={s.phone} />
    </TextPage>
  );
}
