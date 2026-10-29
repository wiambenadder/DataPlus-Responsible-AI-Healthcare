-- =====================================================================
-- Supabase access rules: limit each organization's data to its members
-- =====================================================================
--
-- WHAT THIS DOES
--   Today most tables have rules that apply to "public", which in Supabase
--   means anyone, including people who are not logged in. This script
--   replaces them so that:
--     * people only see and change their own organization's data;
--     * uploaded files are private and only readable by that organization;
--     * sign-up, creating an organization and accepting an invite still work.
--   The `feedback` table already has sensible rules and is left alone.
--
-- WHEN TO RUN IT
--   Only AFTER the website code that adds login checks to the processing
--   routes is live (pull request from the `wiam` branch, Oct 2026). Those
--   routes now act as the logged-in user, so they keep working under these
--   rules. Running this first would break uploads on the old code.
--
-- HOW TO RUN IT
--   1. Supabase dashboard → SQL Editor → New query.
--   2. Run STEP 0 on its own and read the output (nothing is changed).
--   3. Run STEPS 1–5 together. They are wrapped in a transaction: if any
--      line fails, nothing is changed.
--   4. Work through the test checklist at the bottom.
--   5. If something important breaks, run the UNDO section.
--
-- Written for the Innovator Insights team. Read each step before running.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STEP 0 — Look before changing anything (read-only)
-- ---------------------------------------------------------------------
-- Current rules on our tables and on file storage:
-- select schemaname, tablename, policyname, roles, cmd, qual, with_check
-- from pg_policies where schemaname in ('public', 'storage') order by 1, 2, 3;
--
-- Columns of every table (check each table below has `company_id`):
-- select table_name, column_name, data_type from information_schema.columns
-- where table_schema = 'public' order by table_name, ordinal_position;
--
-- Is the "reports" file bucket public right now?
-- select id, public from storage.buckets;
--
-- Users who have a company on their profile but no row in company_members.
-- STEP 1 adds those rows so nobody loses access.
-- select p.id, p.company_id from public.profiles p
-- where p.company_id is not null and not exists (
--   select 1 from public.company_members m
--   where m.user_id = p.id and m.company_id = p.company_id);


begin;

-- ---------------------------------------------------------------------
-- STEP 1 — Helpers and one small schema addition
-- ---------------------------------------------------------------------

-- Remember who created each organization, so the creator can see it and
-- add themselves as its first member. Filled in automatically.
alter table public.companies
  add column if not exists created_by uuid default auth.uid();

-- Make sure everyone who already belongs to an organization through their
-- profile is also listed in company_members (membership now comes from
-- company_members only).
insert into public.company_members (company_id, user_id, role)
select p.company_id, p.id, 'member'
from public.profiles p
where p.company_id is not null
  and not exists (
    select 1 from public.company_members m
    where m.user_id = p.id and m.company_id = p.company_id
  );

-- "Is the logged-in user a member of this organization?"
-- SECURITY DEFINER so it can read company_members without tripping over
-- company_members' own rules. Company IDs are compared as text so this
-- works whatever type the id column uses.
create or replace function public.is_company_member(cid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id::text = cid and m.user_id = auth.uid()
  );
$$;

-- "May the logged-in user add themselves to this organization?"
-- Yes if they created it, or if it has invited their email address.
create or replace function public.can_join_company(cid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
      select 1 from public.companies c
      where c.id::text = cid and c.created_by = auth.uid()
    )
    or exists (
      select 1 from public.company_invites i
      where i.company_id::text = cid
        and lower(i.email) = lower(auth.jwt() ->> 'email')
    );
$$;

revoke all on function public.is_company_member(text) from public;
revoke all on function public.can_join_company(text) from public;
grant execute on function public.is_company_member(text) to authenticated;
grant execute on function public.can_join_company(text) to authenticated;


-- ---------------------------------------------------------------------
-- STEP 2 — Remove the old open rules
-- ---------------------------------------------------------------------
-- Drops every existing rule on these tables (feedback is not touched).
do $$
declare
  r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in (
        'companies', 'company_members', 'company_invites', 'profiles',
        'uploads', 'qualitative_responses', 'domain_mapping',
        'company_background_reports', 'report_drafts', 'standardization_runs'
      )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- STEP 3 — New rules, table by table
-- ---------------------------------------------------------------------

-- Organizations: members see and edit their own; anyone logged in can
-- create one; the creator and invited people can see it before joining.
create policy "companies: read own or invited" on public.companies
  for select to authenticated
  using (
    public.is_company_member(id::text)
    or created_by = auth.uid()
    or public.can_join_company(id::text)
  );
create policy "companies: create" on public.companies
  for insert to authenticated
  with check (true);
create policy "companies: members edit" on public.companies
  for update to authenticated
  using (public.is_company_member(id::text))
  with check (public.is_company_member(id::text));

-- Members list: see your teammates; add yourself only to an organization
-- you created or were invited to; members can remove teammates (as the
-- Company and Team page allows today).
create policy "company_members: read teammates" on public.company_members
  for select to authenticated
  using (public.is_company_member(company_id::text) or user_id = auth.uid());
create policy "company_members: join" on public.company_members
  for insert to authenticated
  with check (user_id = auth.uid() and public.can_join_company(company_id::text));
create policy "company_members: remove" on public.company_members
  for delete to authenticated
  using (public.is_company_member(company_id::text));

-- Invites: members manage their organization's invites; the invited
-- person can see, accept and clear their own invite.
create policy "company_invites: read" on public.company_invites
  for select to authenticated
  using (
    public.is_company_member(company_id::text)
    or lower(email) = lower(auth.jwt() ->> 'email')
  );
create policy "company_invites: members invite" on public.company_invites
  for insert to authenticated
  with check (public.is_company_member(company_id::text));
create policy "company_invites: accept" on public.company_invites
  for update to authenticated
  using (
    public.is_company_member(company_id::text)
    or lower(email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    public.is_company_member(company_id::text)
    or lower(email) = lower(auth.jwt() ->> 'email')
  );
create policy "company_invites: cancel or clear" on public.company_invites
  for delete to authenticated
  using (
    public.is_company_member(company_id::text)
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

-- Profiles: your own, plus your teammates' (for the team list). You can
-- only put an organization on your profile once you are its member, so
-- nobody can attach themselves to someone else's organization.
create policy "profiles: read own and teammates" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (company_id is not null and public.is_company_member(company_id::text))
  );
create policy "profiles: create own" on public.profiles
  for insert to authenticated
  with check (
    id = auth.uid()
    and (company_id is null or public.is_company_member(company_id::text))
  );
create policy "profiles: edit own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (company_id is null or public.is_company_member(company_id::text))
  );

-- Assessment data: members of the organization only, for every action.
do $$
declare
  t text;
begin
  foreach t in array array[
    'uploads', 'qualitative_responses', 'domain_mapping',
    'company_background_reports', 'report_drafts', 'standardization_runs'
  ]
  loop
    -- Skip tables that don't exist; tables without a company_id column get
    -- no rules at all, which means only the server's master key can use
    -- them (the website code doesn't use report_drafts or
    -- standardization_runs today).
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'company_id'
    ) then
      execute format('alter table public.%I enable row level security', t);
      execute format(
        'create policy %I on public.%I for all to authenticated
           using (public.is_company_member(company_id::text))
           with check (public.is_company_member(company_id::text))',
        t || ': members only', t
      );
    elsif exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      raise notice 'Table % has no company_id column: left with no access rules (server key only).', t;
    end if;
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- STEP 4 — Uploaded files ("reports" bucket)
-- ---------------------------------------------------------------------
-- Make the bucket private: files can only be opened with a short-lived
-- signed link, which the website already uses.
update storage.buckets set public = false where id = 'reports';

-- Remove old file rules that mention the reports bucket.
do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ilike '%reports%' or coalesce(with_check, '') ilike '%reports%')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Anyone logged in may upload a file. (The file name is only linked to an
-- organization a moment later, when its row is added to `uploads`.)
create policy "reports: logged-in users upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reports');

-- Only members of the organization that owns the file can open, replace
-- or delete it.
create policy "reports: members read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.uploads u
      where u.file_url = storage.objects.name
        and public.is_company_member(u.company_id::text)
    )
  );
create policy "reports: members change" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.uploads u
      where u.file_url = storage.objects.name
        and public.is_company_member(u.company_id::text)
    )
  );
create policy "reports: members delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.uploads u
      where u.file_url = storage.objects.name
        and public.is_company_member(u.company_id::text)
    )
  );


-- ---------------------------------------------------------------------
-- STEP 5 — Make sure row-level security is on for the core tables
-- ---------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_invites enable row level security;
alter table public.profiles enable row level security;

commit;


-- =====================================================================
-- TEST CHECKLIST (on the live site, after running the script)
-- =====================================================================
-- Use two test accounts in two different organizations (A and B).
--  [ ] Sign up a brand-new account and create an organization.
--  [ ] As A: invite a new email; sign up with it and accept the invite.
--  [ ] As A: upload a PDF; it processes and ratings appear on Results.
--  [ ] As A: open an uploaded document from Your Submissions.
--  [ ] As A: edit an answer; the rating refreshes.
--  [ ] As A: Company and Team shows teammates; you can cancel an invite.
--  [ ] As B: none of A's results, documents or team members are visible.
--  [ ] Logged out: Results, Roadmap and Submissions ask you to log in.
--  [ ] Feedback on a rating still saves, and the admin page still works.
-- If a step fails, note which one and the error, then run UNDO if needed.


-- =====================================================================
-- UNDO — go back to open access (only if something important breaks)
-- =====================================================================
-- This restores "anyone can do anything" on these tables, which is how
-- they behaved before. Run it, fix the problem, then run the script again.
--
-- begin;
-- do $$
-- declare r record; t text;
-- begin
--   for r in select tablename, policyname from pg_policies
--     where schemaname = 'public' and tablename in (
--       'companies','company_members','company_invites','profiles','uploads',
--       'qualitative_responses','domain_mapping','company_background_reports',
--       'report_drafts','standardization_runs')
--   loop
--     execute format('drop policy %I on public.%I', r.policyname, r.tablename);
--   end loop;
--   foreach t in array array['companies','company_members','company_invites',
--     'profiles','uploads','qualitative_responses','domain_mapping',
--     'company_background_reports','report_drafts','standardization_runs']
--   loop
--     if exists (select 1 from information_schema.tables
--                where table_schema = 'public' and table_name = t) then
--       execute format('create policy %I on public.%I for all to public using (true) with check (true)',
--                      t || ': open (undo)', t);
--     end if;
--   end loop;
-- end $$;
-- drop policy if exists "reports: logged-in users upload" on storage.objects;
-- drop policy if exists "reports: members read" on storage.objects;
-- drop policy if exists "reports: members change" on storage.objects;
-- drop policy if exists "reports: members delete" on storage.objects;
-- create policy "reports: open (undo)" on storage.objects for all to public
--   using (bucket_id = 'reports') with check (bucket_id = 'reports');
-- -- If STEP 0 showed the bucket was public before, also run:
-- -- update storage.buckets set public = true where id = 'reports';
-- commit;
