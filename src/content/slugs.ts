/** Every SEO page that exists. Content files must use exactly these slugs. */
export const SERVICE_SLUGS = [
  "zamina-vikon",
  "remont-vikon",
  "regulyuvannya-vikon",
  "zamina-sklopaketiv",
  "balkon-pid-klyuch",
  "vikna-pislya-obstrilu",
  "energozberigayuchi-vikna",
  "vikna-v-pryvatnyi-budynok",
] as const;

export const DISTRICT_SLUGS = [
  "holosiivskyi",
  "darnytskyi",
  "desnianskyi",
  "dniprovskyi",
  "obolonskyi",
  "pecherskyi",
  "podilskyi",
  "sviatoshynskyi",
  "solomianskyi",
  "shevchenkivskyi",
] as const;

export const BUILDING_SLUGS = [
  "khrushchovka",
  "panelna-9-16",
  "cheskyi-proekt",
  "stalinka",
  "novobudova",
  "pryvatnyi-budynok",
] as const;

export const PAGE_SLUGS = ["tsiny", "maistram", "yak-tse-pratsyuie", "polityka-konfidentsiinosti"] as const;

export const REFS: string[] = [
  ...SERVICE_SLUGS.map((s) => `service:${s}`),
  ...DISTRICT_SLUGS.map((s) => `district:${s}`),
  ...BUILDING_SLUGS.map((s) => `building:${s}`),
  ...PAGE_SLUGS.map((s) => `page:${s}`),
];
