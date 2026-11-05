import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { privacyPage } from "@/content/pages";
import { TextPage } from "@/components/text-page";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta({ lang, path: "/polityka-konfidentsiinosti", title: privacyPage[lang].title, description: privacyPage[lang].description });
}

export default async function Page({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return <TextPage lang={lang} path="/polityka-konfidentsiinosti" text={privacyPage[lang]} />;
}
