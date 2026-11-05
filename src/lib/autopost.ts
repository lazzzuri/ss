import { revalidatePath } from "next/cache";
import { hasDb } from "./db";
import { insertPost, listAllPosts, postedToday, slugTaken } from "./posts";
import { TOPICS, writeArticle } from "./ai";
import { generateCover, storeImage } from "./images";
import { notifyTelegram } from "./telegram";
import { siteUrl } from "@/config/site";

export type AutopostResult =
  | { status: "skipped"; reason: string }
  | { status: "created"; id: number; slug: string; title: string; image: string };

export async function runAutopost(opts: { force?: boolean } = {}): Promise<AutopostResult> {
  if (!hasDb()) return { status: "skipped", reason: "DATABASE_URL is not set" };
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return { status: "skipped", reason: "ANTHROPIC_API_KEY is not set" };
  if (!opts.force && (await postedToday())) return { status: "skipped", reason: "already posted today" };

  const existing = await listAllPosts();
  const titles = existing.map((p) => p.title.uk);
  const day = Math.floor(Date.now() / 864e5);
  const topic = TOPICS.find((t, i) => i >= day % TOPICS.length && !titles.some((x) => x.toLowerCase().includes(t.toLowerCase().slice(0, 24)))) ?? TOPICS[day % TOPICS.length];
  const today = new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kyiv", day: "numeric", month: "long", year: "numeric" });

  const article = await writeArticle({ today, topic, existingTitles: titles });

  let slug = article.slug;
  for (let i = 2; await slugTaken(slug); i++) slug = `${article.slug}-${i}`;

  const cover = await generateCover(article.image_prompt, slug);
  const coverUrl = await storeImage(cover.data, slug);

  const id = await insertPost({
    slug,
    publishedAt: new Date().toISOString(),
    status: process.env.AUTOPOST_STATUS === "draft" ? "draft" : "published",
    source: "auto",
    coverUrl,
    coverAlt: { uk: article.uk.cover_alt, ru: article.ru.cover_alt },
    title: { uk: article.uk.title, ru: article.ru.title },
    description: { uk: article.uk.description, ru: article.ru.description },
    body: { uk: article.uk.body, ru: article.ru.body },
    tags: article.tags,
    imagePrompt: article.image_prompt,
  });

  for (const p of ["/uk/blog", "/ru/blog", "/uk", "/ru", "/sitemap.xml"]) revalidatePath(p);
  await notifyTelegram(`Новий пост у блозі (${cover.provider}): ${article.uk.title}\n${siteUrl()}/uk/blog/${slug}`);
  return { status: "created", id, slug, title: article.uk.title, image: coverUrl };
}
