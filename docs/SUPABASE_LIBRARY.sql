-- =====================================================================
-- Resource library for the Roadmap Assistant (RAG)
-- =====================================================================
--
-- WHAT THIS DOES
--   Creates the tables that hold the team's curated library: papers,
--   guidance documents and the short "what to do next" note for each
--   practice, split into passages the assistant can search.
--
--     library_documents           one row per paper, guidance or note
--     library_document_practices  which practices (subdomains) each supports
--     library_chunks              the searchable passages
--     search_library(...)         the search the assistant calls
--
--   Nobody can read or change these tables directly from the website.
--   Logged-in users can only call search_library(); the loading script
--   (scripts/library/ingest.ts) writes with the server key.
--
-- HOW TO RUN IT
--   Supabase dashboard → SQL Editor → New query → paste this file → Run.
--   It is safe to run again. It does not touch any existing table.
--
-- EMBEDDINGS
--   Passages are stored with an "embedding" (a list of numbers capturing
--   their meaning) of 1536 numbers, the size made by OpenAI's
--   text-embedding-3-small. If the Duke AI gateway offers a different
--   model, change 1536 below (three places) to that model's size BEFORE
--   the first run. If no embedding model is available at all, leave it:
--   search then falls back to keyword search only.
-- =====================================================================

begin;

create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------
create table if not exists public.library_documents (
  id uuid primary key default gen_random_uuid(),
  -- Short stable name from the manifest, e.g. "who-ethics-ai-2021".
  slug text not null unique,
  -- Which tool the document belongs to. Ready for the policy and
  -- financing codebooks later.
  collection text not null default 'ai-readiness'
    check (collection in ('ai-readiness', 'policy', 'financing')),
  -- paper | guidance | note ("note" = the team's per-practice note).
  kind text not null default 'paper' check (kind in ('paper', 'guidance', 'note')),
  title text not null,
  authors text,
  year int,
  publisher text,
  url text,
  license text,
  -- Untick to hide a document from the assistant without deleting it.
  published boolean not null default true,
  -- Lets the loading script skip documents that haven't changed.
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Which practices each document supports (exact subdomain names from
-- src/lib/roadmap/framework.ts, e.g. "Bias & Fairness Assessment").
create table if not exists public.library_document_practices (
  document_id uuid not null references public.library_documents (id) on delete cascade,
  subdomain text not null,
  primary key (document_id, subdomain)
);

-- Searchable passages.
create table if not exists public.library_chunks (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.library_documents (id) on delete cascade,
  chunk_index int not null,
  -- Page in the original file, for "p. 12" in citations (null for notes).
  page int,
  content text not null,
  embedding extensions.vector(1536),
  fts tsvector generated always as (to_tsvector('english', content)) stored,
  unique (document_id, chunk_index)
);

create index if not exists library_chunks_fts on public.library_chunks using gin (fts);
create index if not exists library_chunks_document on public.library_chunks (document_id);
create index if not exists library_practices_subdomain on public.library_document_practices (subdomain);
-- No vector index needed at this size (a few thousand passages);
-- an exact search is fast and more accurate.

-- Locked down: no direct access from the website. Only the server key
-- (loading script) and the search function below can read them.
alter table public.library_documents enable row level security;
alter table public.library_document_practices enable row level security;
alter table public.library_chunks enable row level security;

-- ---------------------------------------------------------------------
-- Search
-- ---------------------------------------------------------------------
-- Finds the best passages for a question:
--   1. keeps documents tagged with any of `practice_filter` (if given),
--   2. ranks passages by keywords and, if an embedding is given, meaning,
--      and combines the two rankings (reciprocal rank fusion),
--   3. always includes the team's notes for the filtered practices,
--      ranked first, because they are written for innovators.
create or replace function public.search_library(
  query_text text,
  query_embedding extensions.vector(1536) default null,
  practice_filter text[] default null,
  collection_filter text default 'ai-readiness',
  match_count int default 6
)
returns table (
  chunk_id bigint,
  slug text,
  title text,
  kind text,
  url text,
  authors text,
  year int,
  page int,
  content text,
  practices text[],
  score double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with docs as (
    select d.id, d.slug, d.title, d.kind, d.url, d.authors, d.year,
           array_agg(p.subdomain order by p.subdomain) as practices
    from library_documents d
    join library_document_practices p on p.document_id = d.id
    where d.published and d.collection = collection_filter
    group by d.id
    having practice_filter is null
        or array_agg(p.subdomain) && practice_filter
  ),
  candidates as (
    select c.id, c.document_id, c.page, c.content, c.embedding, c.fts, docs.kind
    from library_chunks c
    join docs on docs.id = c.document_id
  ),
  -- Any of the question's words (not all of them), stemmed.
  q as (
    select nullif(replace(plainto_tsquery('english', coalesce(query_text, ''))::text, '&', '|'), '')::tsquery as tsq
  ),
  by_text as (
    select c.id, row_number() over (order by ts_rank_cd(c.fts, q.tsq) desc) as r
    from candidates c, q
    where q.tsq is not null and c.fts @@ q.tsq
    order by r
    limit 50
  ),
  by_meaning as (
    select c.id, row_number() over (order by c.embedding <=> query_embedding) as r
    from candidates c
    where query_embedding is not null and c.embedding is not null
    order by r
    limit 50
  ),
  notes as (
    select c.id, 1::bigint as r
    from candidates c
    where c.kind = 'note' and practice_filter is not null
  ),
  fused as (
    select id, sum(1.0 / (60 + r)) as score
    from (
      select id, r from by_text
      union all select id, r from by_meaning
      union all select id, r from notes
    ) ranked
    group by id
  )
  select c.id, docs.slug, docs.title, docs.kind, docs.url, docs.authors, docs.year,
         c.page, c.content, docs.practices,
         (f.score + case when docs.kind = 'note' then 0.05 else 0 end)::double precision
  from fused f
  join candidates c on c.id = f.id
  join docs on docs.id = c.document_id
  order by 11 desc
  limit greatest(1, least(match_count, 12));
$$;

revoke all on function public.search_library(text, extensions.vector, text[], text, int) from public, anon;
grant execute on function public.search_library(text, extensions.vector, text[], text, int) to authenticated, service_role;

commit;

-- =====================================================================
-- CHECKS (optional, after the loading script has run)
-- =====================================================================
-- How many documents, practices covered and passages:
-- select kind, count(*) from library_documents group by kind;
-- select count(distinct subdomain) from library_document_practices;
-- select count(*), count(embedding) as with_embedding from library_chunks;
--
-- Practices with fewer than two sources:
-- select subdomain, count(*) from library_document_practices p
-- join library_documents d on d.id = p.document_id and d.kind <> 'note'
-- group by subdomain having count(*) < 2 order by 1;

-- =====================================================================
-- UNDO (removes the library completely)
-- =====================================================================
-- drop function if exists public.search_library(text, extensions.vector, text[], text, int);
-- drop table if exists public.library_chunks;
-- drop table if exists public.library_document_practices;
-- drop table if exists public.library_documents;
