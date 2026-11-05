import { unstable_cache, revalidateTag } from "next/cache";
import type { L } from "@/content/types";
import { seedPosts } from "@/content/seed-posts";
import { hasDb, sql } from "./db";

export type PostStatus = "published" | "draft";

export interface Post {
  id: number | null; // null for built-in seed posts
  slug: string;
  publishedAt: string;
  status: PostStatus;
  source: "seed" | "auto" | "manual";
  coverUrl: string;
  coverAlt: L;
  title: L;
  description: L;
  body: L;
  tags: string[];
  imagePrompt?: string | null;
}

export type PostInput = Omit<Post, "id">;

function fromSeed(): Post[] {
  return seedPosts.map((p) => ({
    id: null,
    slug: p.slug,
    publishedAt: new Date(`${p.date}T07:00:00Z`).toISOString(),
    status: "published",
    source: "seed",
    coverUrl: `/api/cover/${p.slug}`,
    coverAlt: p.coverAlt,
    title: p.title,
    description: p.description,
    body: p.body,
    tags: p.tags,
  }));
}

function row(r: Record<string, unknown>): Post {
  return {
    id: Number(r.id),
    slug: r.slug as string,
    publishedAt: new Date(r.published_at as string).toISOString(),
    status: (r.status as PostStatus) ?? "published",
    source: (r.source as Post["source"]) ?? "auto",
    coverUrl: (r.cover_url as string) || `/api/cover/${r.slug as string}`,
    coverAlt: (r.cover_alt as L) ?? { uk: "", ru: "" },
    title: r.title as L,
    description: r.description as L,
    body: r.body as L,
    tags: (r.tags as string[]) ?? [],
    imagePrompt: (r.image_prompt as string) ?? null,
  };
}

async function dbPosts(onlyPublished: boolean): Promise<Post[]> {
  if (!hasDb()) return [];
  try {
    const db = await sql();
    const rows = onlyPublished
      ? await db`select * from posts where status = 'published' and published_at <= now() order by published_at desc limit 500`
      : await db`select * from posts order by published_at desc limit 500`;
    return rows.map(row);
  } catch (e) {
    console.error("posts: database unavailable", e);
    return [];
  }
}

async function loadPublished(): Promise<Post[]> {
  const fromDb = await dbPosts(true);
  const taken = new Set(fromDb.map((p) => p.slug));
  return [...fromDb, ...fromSeed().filter((p) => !taken.has(p.slug))].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Published posts (database + built-in), newest first. Cached; invalidated by the "posts" tag. */
export const listPublishedPosts = unstable_cache(loadPublished, ["posts-v1"], { tags: ["posts"], revalidate: 600 });

export async function getPublishedPost(slug: string): Promise<Post | null> {
  return (await listPublishedPosts()).find((p) => p.slug === slug) ?? null;
}

// ---------- admin ----------

export async function listAllPosts(): Promise<Post[]> {
  const fromDb = await dbPosts(false);
  const taken = new Set(fromDb.map((p) => p.slug));
  return [...fromDb, ...fromSeed().filter((p) => !taken.has(p.slug))].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostById(id: number): Promise<Post | null> {
  const db = await sql();
  const r = await db`select * from posts where id = ${id}`;
  return r[0] ? row(r[0]) : null;
}

export async function slugTaken(slug: string): Promise<boolean> {
  if (seedPosts.some((p) => p.slug === slug)) return true;
  const db = await sql();
  const r = await db`select 1 from posts where slug = ${slug}`;
  return r.length > 0;
}

export async function insertPost(p: PostInput): Promise<number> {
  const db = await sql();
  const r = await db`
    insert into posts (published_at, slug, status, source, cover_url, cover_alt, title, description, body, tags, image_prompt)
    values (${p.publishedAt}, ${p.slug}, ${p.status}, ${p.source}, ${p.coverUrl}, ${db.json(p.coverAlt as never)},
      ${db.json(p.title as never)}, ${db.json(p.description as never)}, ${db.json(p.body as never)}, ${p.tags}, ${p.imagePrompt ?? null})
    returning id`;
  revalidateTag("posts");
  return Number(r[0].id);
}

export async function updatePost(id: number, p: Pick<Post, "title" | "description" | "body" | "status" | "tags" | "coverAlt">): Promise<void> {
  const db = await sql();
  await db`
    update posts set title = ${db.json(p.title as never)}, description = ${db.json(p.description as never)},
      body = ${db.json(p.body as never)}, status = ${p.status}, tags = ${p.tags}, cover_alt = ${db.json(p.coverAlt as never)}
    where id = ${id}`;
  revalidateTag("posts");
}

export async function setPostStatus(id: number, status: PostStatus): Promise<void> {
  const db = await sql();
  await db`update posts set status = ${status} where id = ${id}`;
  revalidateTag("posts");
}

export async function deletePost(id: number): Promise<void> {
  const db = await sql();
  await db`delete from posts where id = ${id}`;
  revalidateTag("posts");
}

/** Copy a built-in seed post into the database so it can be edited or hidden. */
export async function materializeSeed(slug: string): Promise<number | null> {
  const seed = fromSeed().find((p) => p.slug === slug);
  if (!seed) return null;
  const { id: _ignored, ...rest } = seed;
  return insertPost({ ...rest, source: "manual" });
}

export async function postedToday(): Promise<boolean> {
  const db = await sql();
  const r = await db`
    select 1 from posts where source = 'auto'
      and created_at > date_trunc('day', now() at time zone 'Europe/Kyiv') at time zone 'Europe/Kyiv' limit 1`;
  return r.length > 0;
}

export function readingMinutes(md: string): number {
  return Math.max(2, Math.round(md.split(/\s+/).length / 180));
}
