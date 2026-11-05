import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { SERVICE_SLUGS } from "@/content/slugs";
import { EntryPage, entryMetadata } from "@/components/entry-page";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  return entryMetadata(lang, "service", slug);
}

export default async function Page({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  return <EntryPage lang={lang} kind="service" slug={slug} />;
}
