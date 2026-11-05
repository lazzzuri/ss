import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { SERVICE_SLUGS, DISTRICT_SLUGS, BUILDING_SLUGS } from "@/content/slugs";
import { listPublishedPosts } from "@/lib/posts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const paths: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/poslugy", priority: 0.8, freq: "weekly" },
    { path: "/rayony", priority: 0.7, freq: "weekly" },
    { path: "/budynky", priority: 0.7, freq: "weekly" },
    { path: "/tsiny", priority: 0.9, freq: "weekly" },
    { path: "/blog", priority: 0.7, freq: "daily" },
    { path: "/yak-tse-pratsyuie", priority: 0.4, freq: "monthly" },
    { path: "/maistram", priority: 0.4, freq: "monthly" },
    { path: "/polityka-konfidentsiinosti", priority: 0.2, freq: "monthly" },
    ...SERVICE_SLUGS.map((s) => ({ path: `/poslugy/${s}`, priority: 0.9, freq: "weekly" as const })),
    ...DISTRICT_SLUGS.map((s) => ({ path: `/rayony/${s}`, priority: 0.7, freq: "monthly" as const })),
    ...BUILDING_SLUGS.map((s) => ({ path: `/budynky/${s}`, priority: 0.7, freq: "monthly" as const })),
  ];
  const entries: MetadataRoute.Sitemap = [];
  for (const p of paths) {
    for (const lang of ["uk", "ru"] as const) {
      entries.push({
        url: `${base}/${lang}${p.path}`,
        lastModified: now,
        changeFrequency: p.freq,
        priority: lang === "uk" ? p.priority : Math.max(0.1, p.priority - 0.1),
        alternates: { languages: { uk: `${base}/uk${p.path}`, ru: `${base}/ru${p.path}` } },
      });
    }
  }
  for (const post of await listPublishedPosts()) {
    for (const lang of ["uk", "ru"] as const) {
      entries.push({
        url: `${base}/${lang}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: { uk: `${base}/uk/blog/${post.slug}`, ru: `${base}/ru/blog/${post.slug}` } },
        images: [post.coverUrl.startsWith("http") ? post.coverUrl : `${base}${post.coverUrl}`],
      });
    }
  }
  return entries;
}
