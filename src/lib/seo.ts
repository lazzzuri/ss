import type { Metadata } from "next";
import type { Faq, L, Lang } from "@/content/types";
import { BRAND, siteUrl } from "@/config/site";
import { href } from "@/i18n/routes";
import { plain } from "./inline";

const OG_LOCALE: L = { uk: "uk_UA", ru: "ru_UA" };

export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl()}${path}`;
}

/** Metadata with canonical + hreflang alternates for a language-less path. */
export function pageMeta(opts: {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
}): Metadata {
  const { lang, path, title, description } = opts;
  const url = href(lang, path);
  const image = opts.image ?? "/og.png";
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: { uk: href("uk", path), ru: href("ru", path), "x-default": href("uk", path) },
    },
    openGraph: {
      type: opts.type ?? "website",
      url,
      title,
      description,
      siteName: BRAND[lang],
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[lang === "uk" ? "ru" : "uk"]],
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

export type JsonLdObject = Record<string, unknown>;

export function breadcrumbLd(items: { name: string; path: string }[], lang: Lang): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(href(lang, it.path)),
    })),
  };
}

export function faqLd(faq: Faq[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: plain(f.q),
      acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
    })),
  };
}

export function orgLd(lang: Lang, phone?: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#org`,
    name: BRAND[lang],
    url: absolute(href(lang)),
    logo: absolute("/icon.png"),
    areaServed: { "@type": "City", name: lang === "uk" ? "Київ" : "Киев" },
    ...(phone ? { telephone: phone } : {}),
  };
}

export function websiteLd(lang: Lang): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: BRAND[lang],
    url: absolute(href(lang)),
    inLanguage: lang === "uk" ? "uk-UA" : "ru-UA",
    publisher: { "@id": `${siteUrl()}/#org` },
  };
}

export function serviceLd(opts: { lang: Lang; name: string; description: string; path: string; priceFrom?: number }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: absolute(href(opts.lang, opts.path)),
    areaServed: { "@type": "City", name: opts.lang === "uk" ? "Київ" : "Киев" },
    provider: { "@id": `${siteUrl()}/#org` },
    ...(opts.priceFrom
      ? { offers: { "@type": "Offer", priceCurrency: "UAH", price: opts.priceFrom, priceSpecification: { "@type": "UnitPriceSpecification", price: opts.priceFrom, priceCurrency: "UAH", unitText: "m2" } } }
      : {}),
  };
}

export function articleLd(opts: { lang: Lang; title: string; description: string; path: string; image: string; published: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    image: [absolute(opts.image)],
    datePublished: opts.published,
    dateModified: opts.published,
    inLanguage: opts.lang === "uk" ? "uk-UA" : "ru-UA",
    mainEntityOfPage: absolute(href(opts.lang, opts.path)),
    author: { "@type": "Organization", name: BRAND[opts.lang] },
    publisher: { "@id": `${siteUrl()}/#org` },
  };
}
