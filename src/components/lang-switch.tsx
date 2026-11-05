"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/content/types";

export function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname() || `/${lang}`;
  const rest = path.replace(/^\/(uk|ru)(?=\/|$)/, "");
  const to = (l: Lang) => `/${l}${rest}`;
  return (
    <div className="lang" role="group" aria-label="Мова / Язык">
      <Link href={to("uk")} onClick={() => { document.cookie = "lang=uk; path=/; max-age=31536000"; }} hrefLang="uk" aria-current={lang === "uk" ? "true" : undefined} prefetch={false}>
        UA
      </Link>
      <Link href={to("ru")} onClick={() => { document.cookie = "lang=ru; path=/; max-age=31536000"; }} hrefLang="ru" aria-current={lang === "ru" ? "true" : undefined} prefetch={false}>
        RU
      </Link>
    </div>
  );
}
