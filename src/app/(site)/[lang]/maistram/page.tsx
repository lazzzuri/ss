import type { Metadata } from "next";
import type { Lang } from "@/content/types";
import { mastersPage } from "@/content/pages";
import { catalogOf } from "@/content/catalog";
import { TextPage } from "@/components/text-page";
import { PartnerForm } from "@/components/forms";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta({ lang, path: "/maistram", title: mastersPage[lang].title, description: mastersPage[lang].description });
}

export default async function Page({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const districts = catalogOf("district").map((x) => ({ slug: x.slug, name: x.name[lang] }));
  return (
    <TextPage lang={lang} path="/maistram" text={mastersPage[lang]}>
      <PartnerForm lang={lang} districts={districts} />
    </TextPage>
  );
}
