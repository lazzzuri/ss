import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { REFS } from "@/content/slugs";

const LangPart = z.object({
  title: z.string().describe("Article title, up to 70 characters"),
  description: z.string().describe("Meta description, 130-160 characters"),
  body: z.string().describe("Markdown body: ## headings, paragraphs, lists; 700-1000 words"),
  cover_alt: z.string().describe("Short alt text for the cover image"),
});

const ArticleSchema = z.object({
  slug: z.string().describe("Latin transliteration of the Ukrainian title, lowercase words joined by hyphens, up to 70 chars"),
  tags: z.array(z.string()).describe("2-4 short lowercase Ukrainian tags"),
  image_prompt: z.string().describe("English prompt for a realistic editorial photo that fits the article; no text in the image"),
  uk: LangPart,
  ru: LangPart,
});

export type Article = z.infer<typeof ArticleSchema>;

export const TOPICS = [
  "Як вибрати профіль для вікон у квартиру: камери, монтажна ширина, армування",
  "Чому запотівають вікна взимку і що з цим робити",
  "Однокамерний чи двокамерний склопакет: що обрати для Києва",
  "Енергозберігаюче скло: чи варто доплачувати під час блекаутів",
  "Як підготувати квартиру до заміру і монтажу вікон",
  "Вікна в новобудові: що перевірити під час приймання квартири",
  "Балкон: засклити, утеплити чи винести — що реально у Києві",
  "Протизламна фурнітура: які класи бувають і кому вона потрібна",
  "Що робити, якщо дме з-під підвіконня або з укосів",
  "Як доглядати за ущільнювачами, щоб вікна служили довше",
  "Захисна плівка на вікна від вибухової хвилі: міфи і факти",
  "Мікропровітрювання взимку: так чи ні",
  "Ламінація профілю: що це таке і скільки коштує",
  "Монтажні стрічки і піна: що має бути у правильному монтажі",
  "Як вибрати майстра з вікон і не помилитися",
  "Гарантія на вікна: що вона покриває і як нею скористатися",
  "Підвіконня з ПВХ, каменю чи дерева: порівняння",
  "Відливи, укоси і підвіконня: навіщо вони і скільки коштують",
  "Чи можна міняти вікна взимку",
  "Дерев'яні вікна в сталінці: реставрувати чи міняти на ПВХ",
  "Шумоізоляція вікон біля жвавої дороги",
  "Дитячий замок і обмежувачі відкривання вікон",
  "Як самостійно відрегулювати пластикове вікно і коли краще викликати майстра",
  "Заміна склопакета без заміни рами: коли це має сенс",
  "Вікна для приватного будинку: теплий монтаж і енергоефективність",
  "Панорамні вікна в квартирі: що врахувати",
  "Розсувні системи для балкона: алюміній чи ПВХ",
  "Коли вікна краще ремонтувати, а коли міняти",
  "Москітні сітки: рамкові, ролетні, плісе — що обрати",
  "Як вікна впливають на рахунки за опалення",
];

const SYSTEM = `You write daily blog articles for «Ясне вікно» (Ukrainian) / «Ясное окно» (Russian), a Kyiv service that matches people with vetted independent window masters.

How the service works: a visitor describes their windows on the site and sees an approximate price; the request goes to ONE master with free slots in their district; the master calls, measures, and the client signs the contract and pays the master directly. Free for the client; masters pay per request. The service is not a manufacturer and has no own crews.

Facts you may use (do not invent others): Kyiv installers are often booked 2–3 weeks ahead; PVC window prices rose ~30–40% in half a year in 2026; a standard PVC window costs roughly 5 500–6 500 UAH per m². The site calculator uses approximate prices: Економ 5 200, Стандарт 6 000, Енергозберігаючий 7 200 UAH/m², installation ≈ +15%. Measurement usually within 3–7 days. «єВідновлення» compensates repairs of housing damaged by attacks: a commission records the damage, the amount follows its checklist, application in Diia.

Rules:
- Practical, technically correct, calm expert tone. No invented statistics, studies, reviews, company names, addresses or prices beyond the facts above. If unsure about a number, leave it out.
- Write the Ukrainian version in natural literary Ukrainian and the Russian version in natural Russian; same facts, not word-for-word translations.
- Body in Markdown: 4–6 "## " sections, short paragraphs, lists where useful, no H1, no images, no raw HTML, 700–1000 words per language.
- Add 3–5 internal links inside the body using the form [anchor text](REF), where REF is exactly one of: ${REFS.join(", ")}. Never link to external sites.
- End with a short paragraph inviting the reader to calculate the price on the site or call a master, without pressure.
- The image prompt describes a realistic scene that fits the article (for example a bright Kyiv apartment window, a master adjusting a sash, frost on glass) and must not ask for any text.`;

export async function writeArticle(opts: { today: string; topic: string; existingTitles: string[] }): Promise<Article> {
  const client = new Anthropic();
  const user = `Today is ${opts.today}. Write one new article.
Topic suggestion: ${opts.topic}
You may adjust the angle to the season, but do not repeat these existing titles or their topics:
${opts.existingTitles.slice(0, 80).map((t) => `- ${t}`).join("\n") || "- (none yet)"}`;

  const msg = await client.beta.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ArticleSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
  });

  if (msg.stop_reason === "refusal") throw new Error("The model declined to write this article");
  if (msg.stop_reason === "max_tokens") throw new Error("Article was cut off by max_tokens");
  const a = msg.parsed_output;
  if (!a) throw new Error("Could not parse the article");
  return cleanArticle(a);
}

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Keeps only allowed internal links and normalizes the slug. */
export function cleanArticle(a: Article): Article {
  const fix = (md: string) => md.replace(LINK, (m, text: string, ref: string) => (REFS.includes(ref.trim()) ? `[${text}](${ref.trim()})` : text)).replace(/^#\s+.*$/gm, "").trim();
  const slug = a.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || `post-${Date.now()}`;
  return {
    ...a,
    slug,
    tags: a.tags.slice(0, 4).map((t) => t.toLowerCase().trim()).filter(Boolean),
    uk: { ...a.uk, body: fix(a.uk.body), title: a.uk.title.trim().slice(0, 90), description: a.uk.description.trim().slice(0, 170) },
    ru: { ...a.ru, body: fix(a.ru.body), title: a.ru.title.trim().slice(0, 90), description: a.ru.description.trim().slice(0, 170) },
  };
}
