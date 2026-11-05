import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { SectionIndex, sectionMetadata } from "@/components/entry-page";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return sectionMetadata(lang, "service");
}

export default async function Page({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return <SectionIndex lang={lang} kind="service" />;
}
