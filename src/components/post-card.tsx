import Link from "next/link";
import type { Lang } from "@/content/types";
import type { Post } from "@/lib/posts";
import { readingMinutes } from "@/lib/posts";
import { t } from "@/i18n/dict";
import { href } from "@/i18n/routes";

export function PostCard({ lang, post }: { lang: Lang; post: Post }) {
  const d = t(lang);
  const date = new Date(post.publishedAt).toLocaleDateString(lang === "uk" ? "uk-UA" : "ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Kyiv" });
  return (
    <Link className="post-card glass" href={href(lang, `/blog/${post.slug}`)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cover" src={post.coverUrl} alt={post.coverAlt[lang] || post.title[lang]} loading="lazy" width={1536} height={1024} />
      <span className="body">
        <span className="meta">{date} · {readingMinutes(post.body[lang])} {d.page.minutes}</span>
        <h3>{post.title[lang]}</h3>
        <p>{post.description[lang]}</p>
      </span>
    </Link>
  );
}
