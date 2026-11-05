import postgres from "postgres";

type Sql = postgres.Sql<Record<string, unknown>>;

let client: Sql | null = null;
let schema: Promise<void> | null = null;

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function hasDb(): boolean {
  return !!databaseUrl();
}

export class NoDatabaseError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
  }
}

function connect(): Sql {
  const url = databaseUrl();
  if (!url) throw new NoDatabaseError();
  if (!client) {
    client = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      // pgbouncer / Supabase pooler / Neon pooler friendly
      prepare: false,
      onnotice: () => {},
    });
  }
  return client;
}

const DDL = `
create table if not exists leads (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  lang text not null default 'uk',
  service text not null default 'zamina-vikon',
  name text,
  phone text not null,
  district text,
  address text,
  housing text,
  floor int,
  urgent boolean not null default false,
  damage boolean not null default false,
  photos boolean not null default false,
  problems text[] not null default '{}',
  comment text,
  windows jsonb not null default '[]',
  profile text,
  extras text[] not null default '{}',
  area numeric,
  price_low int,
  price_high int,
  page text,
  utm jsonb,
  ip_hash text,
  status text not null default 'new',
  partner_id bigint,
  sold_price int,
  notes text
);
create index if not exists leads_created_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);

create table if not exists partners (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  phone text,
  telegram text,
  email text,
  districts text[] not null default '{}',
  services text[] not null default '{}',
  price_per_lead int,
  status text not null default 'applied',
  notes text
);

create table if not exists posts (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  slug text not null unique,
  status text not null default 'published',
  source text not null default 'auto',
  cover_url text,
  cover_alt jsonb not null default '{}',
  title jsonb not null,
  description jsonb not null,
  body jsonb not null,
  tags text[] not null default '{}',
  image_prompt text
);
create index if not exists posts_published_idx on posts (status, published_at desc);

create table if not exists images (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  mime text not null,
  data bytea not null
);

create table if not exists events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  vid text not null,
  sid text not null,
  type text not null,
  path text,
  label text,
  value double precision,
  meta jsonb,
  lang text,
  ref text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  browser text,
  country text,
  width int
);
create index if not exists events_ts_idx on events (ts desc);
create index if not exists events_vid_idx on events (vid, ts);
create index if not exists events_sid_idx on events (sid, ts);
create index if not exists events_type_ts_idx on events (type, ts desc);
alter table leads add column if not exists vid text;
alter table leads add column if not exists sid text;

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
`;

/** Returns a ready client; creates tables on first use. Throws NoDatabaseError without DATABASE_URL. */
export async function sql(): Promise<Sql> {
  const s = connect();
  if (!schema) {
    schema = s.unsafe(DDL).then(() => undefined);
    schema.catch(() => {
      schema = null;
    });
  }
  await schema;
  return s;
}
