# Auth bridge execution plan — FOR APPROVAL, NOT APPLIED

*Drafted 2026-09-11 · Project `imprsuvtgqxepwzimqmc` · KalaCart / SIH26090*
*Status: **plan only**. No SQL run, no policy touched, no row modified.*

Supersedes the sequencing in `auth-migration-plan.md` §7 where the two differ.
The design there (add a column, do not re-key) still stands and is not revisited.

---

## 0. Blocker: no database access in this session

The read-only inventory in phase 1 **cannot be executed right now.** There is no
Supabase MCP tool available in this session, and `.env.local` carries only
`VITE_SUPABASE_ANON_KEY` — no service-role key. The anon key cannot read
`auth.users`, `pg_policies`, or `pg_constraint`, so there is no fallback script.

Every number quoted below comes from `auth-migration-plan.md`, measured
2026-09-10 — **before** the Android app migrated to Supabase Auth and before the
13 fixture profiles were deleted. Both events invalidate the counts.

**Nothing in phases 1–6 should be run until the connector is re-authorized.**
The plan is written so that phase 1 refreshes every number first.

---

## 1. What changed since the migration plan was written

`auth-migration-plan.md` opens on two premises that the handoff now contradicts:

| Premise in the plan (2026-09-10) | State today (2026-09-11) |
|---|---|
| Android authenticates against **Firebase** | Migrated to **Supabase Auth** mid-project |
| 18 `profiles`, 13 of them test fixtures | Fixtures **deleted** — expect ~5 real rows |
| `auth.users` = 1 | Unknown, expect >= 5 — real users have re-registered |
| Plan §3: *create* the 5 auth users via Admin API | Likely **already created** by the app |

This is the single most important correction. The plan's §3 says to *mint*
`auth.users` rows through the Admin API. If the Android app has already
registered these people, minting more creates **duplicate identities** — a
second login for the same human, and a match key that is no longer unique.

**Phase 1 must establish which world we are in before phase 2 matches anything.**

## 2. The match key — the whole risk

Three candidate predicates, ranked:

1. **`firebase_uid` → `auth.users.raw_user_meta_data`.** Strongest *if* the
   Android migration preserved the old UID at signup. Exact, immune to typos
   and case. Must be checked for first — phase 1 asks explicitly.
2. **Email.** The plan measured 18 distinct emails across 18 rows, so it was
   clean; with fixtures gone it should still be. Compare `lower(btrim(...))` on
   both sides. This is the likely key.
3. **Phone.** Rejected as primary. The plan found 7 profiles sharing
   `+919876543210` and 6 sharing `+919123456780`. Those clusters were entirely
   inside the fixtures, so phone *may* now be clean — but it also carries a
   format trap (`9440156395` bare in `profiles` vs E.164 in `auth.users`), so a
   naive equality join silently matches zero rows while a normalized one is a
   second chance to be wrong. Tie-breaker only, and only with an explicit
   `regexp_replace` normalization shown in the diff.

**A row matching on neither is not guessed at.** It stays unmapped and is handled
under phase 3 — never inferred from name similarity.

---

## Phase 1 — Inventory (read-only, zero writes)

```sql
-- 1a. profiles shape and size
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema='public' and table_name='profiles'
 order by ordinal_position;

select count(*) as profiles_total,
       count(*) filter (where email is not null and btrim(email) <> '') as with_email,
       count(*) filter (where phone is not null and btrim(phone) <> '') as with_phone,
       count(*) filter (where firebase_uid is not null)                 as with_firebase_uid
  from public.profiles;

-- 1b. does auth_user_id exist yet? (plan §2 proposed it; may be unapplied)
select column_name from information_schema.columns
 where table_schema='public' and table_name='profiles' and column_name='auth_user_id';

-- 1c. auth.users side
select count(*) as auth_users_total,
       count(*) filter (where email is not null) as with_email,
       count(*) filter (where phone is not null) as with_phone,
       count(*) filter (where email_confirmed_at is not null) as confirmed
  from auth.users;

select provider, count(*) from auth.identities group by provider;

-- 1d. IS THE FIREBASE UID PRESERVED? — decides the match key
select count(*) filter (where raw_user_meta_data ? 'firebase_uid') as meta_snake,
       count(*) filter (where raw_user_meta_data ? 'firebaseUid')  as meta_camel
  from auth.users;
select id, email, raw_user_meta_data from auth.users limit 10;

-- 1e. full policy list on the six tables in scope
select tablename, policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname='public'
   and tablename in ('products','sellers','buyers','enquiries','orders','messages')
 order by tablename, policyname;

-- 1f. RLS actually enabled? (a policy on a table with RLS off is decorative)
select relname, relrowsecurity, relforcerowsecurity
  from pg_class where relnamespace='public'::regnamespace
   and relname in ('products','sellers','buyers','enquiries','orders','messages');
```

**Gate:** present 1a–1f as a table and stop. If `auth_user_id` already exists and
is populated, something has run that neither document records — stop and
reconcile before anything else.

## Phase 2 — Match as SELECT, never UPDATE

No `UPDATE` appears in this phase at all.

```sql
-- 2a. the candidate join, row by row. ~5 rows: read every one, do not sample.
select p.id as profile_id, p.full_name, p.role,
       p.email as profile_email, u.email as auth_email,
       p.phone as profile_phone, u.phone as auth_phone,
       u.id as auth_user_id, u.created_at as auth_created
  from public.profiles p
  left join auth.users u on lower(btrim(p.email)) = lower(btrim(u.email))
 order by p.full_name;

-- 2b. zero-match and multi-match counts
with m as (
  select p.id, count(u.id) as n
    from public.profiles p
    left join auth.users u on lower(btrim(p.email)) = lower(btrim(u.email))
   group by p.id)
select count(*) filter (where n = 0) as matches_zero,
       count(*) filter (where n = 1) as matches_one,
       count(*) filter (where n > 1) as matches_many
  from m;

-- 2c. duplicate check, BOTH sides — non-unique on either side is the failure
--     mode that attaches one person's profile to another person's login
select lower(btrim(email)) k, count(*) c from public.profiles group by 1 having count(*) > 1;
select lower(btrim(email)) k, count(*) c from auth.users     group by 1 having count(*) > 1;

-- 2d. reverse direction: auth users with no profile
select u.id, u.email, u.created_at
  from auth.users u
  left join public.profiles p on lower(btrim(p.email)) = lower(btrim(u.email))
 where p.id is null;
```

**Gate:** proceed only if `matches_many = 0` **and** both 2c queries return zero
rows. Any duplicate stops the migration — that is constraint #1, and not
something to resolve by picking one.

## Phase 3 — Orphan policy, both directions

Two populations, two different answers. **Proposing, not choosing** — both need
sign-off.

**(a) Profile with no auth user** — has not re-registered since the switch.
- *Proposed:* leave `auth_user_id` NULL. Do not mint an account for them.
- *Consequence, plainly:* once `*_all` is dropped, their app access **stops
  working** until they sign up. For a seller that means their products become
  invisible to them (still publicly readable if `approved`).
- *Alternative:* mint via Admin API with a forced password reset — creates an
  account the person never asked for. Not without an explicit yes.
- *Either way:* enumerate them by name before the policy swap, so the teammate
  can be told exactly who must re-register.

**(b) Auth user with no profile** — post-migration signup where the client never
created the `profiles` row.
- *Proposed:* leave alone in this migration; they simply have no data.
- *Real fix is server-side:* an `AFTER INSERT ON auth.users` trigger creating the
  profile so the client cannot skip it (migration plan §5 item 3). That is a
  **write-path change, therefore constraint #3** — flagged for the teammate, not
  shipped here.

## Phase 4 — Backfill, then verify identity for real

```sql
-- 4a. add the column if 1b showed it absent (additive — constraint #4)
alter table public.profiles
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists idx_profiles_auth_user_id
  on public.profiles (auth_user_id) where auth_user_id is not null;
-- This partial unique index is the structural guarantee behind constraint #1:
-- even a wrong backfill cannot attach two profiles to one login.

-- 4b. backfill in an explicit transaction, counts read BEFORE commit
begin;
update public.profiles p
   set auth_user_id = u.id
  from auth.users u
 where lower(btrim(p.email)) = lower(btrim(u.email))
   and p.auth_user_id is null;
-- expect exactly matches_one from 2b. If it differs, ROLLBACK.
select count(*) filter (where auth_user_id is null)     as unmapped,
       count(*) filter (where auth_user_id is not null) as mapped
  from public.profiles;
-- commit;   <- typed by hand only after the numbers are read
```

**4c. Verify `auth.uid()` genuinely resolves.** An updated row count proves the
UPDATE ran, not that authentication works. Trusting it is exactly how this fails
silently.

```sql
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<a real auth.users.id>","role":"authenticated"}';
  select auth.uid()                  as resolved_uid;  -- expect the uuid, NOT null
  select public.current_profile_id() as profile_id;    -- expect that person's profile
  select public.current_seller_id()  as seller_id;     -- expect their seller row
rollback;
```

Better still, and what I would actually trust: sign in through the real client
and confirm `auth.uid()` over PostgREST. The `set local` form proves the SQL
chain; only a real JWT proves the token path — which is the half that was broken
(migration plan §5 item 2).

**Gate:** if `resolved_uid` is null, **stop.** Every phase-5 policy depends on it
and applying them would deny-all.

## Phase 5 — Policy swap: scoped on first, `*_all` dropped last

Order is the safety property. At no instant is a table left with no policy.

1. Create the three helpers (`current_profile_id`, `current_seller_id`,
   `current_buyer_id`) — bodies as in migration plan §4, unchanged.
2. `revoke execute ... from anon, public; grant execute ... to authenticated;`
   They are `SECURITY DEFINER`; leaving them anon-executable repeats lint
   0028/0029.
3. Create **all** scoped policies. Permissive policies are OR-ed, so adding them
   alongside `*_all` changes nothing yet — deliberately a no-op.
4. Re-run 4c as a real user and confirm expected rows come back **with both sets
   live**. This is the rehearsal.
5. Only then drop `products_all`, `sellers_all`, `buyers_all`, `enquiries_all`,
   one at a time, re-testing between each.

Rollback is one statement per table, pasted and ready before starting:
`create policy "products_all" on public.products for all using (true) with check (true);`

**The `enquiries` anon carve-out (constraint #2):**

```sql
create policy "Anyone creates an enquiry" on public.enquiries
  for insert to anon, authenticated with check (true);
```

Note `to anon, authenticated` and `with check (true)` — no `auth.uid()` term
anywhere in the insert path. A guest still cannot *read* the enquiry back (no
identity to match on); per migration plan §4 that is correct for a linkage model,
and is treated here as a deliberate choice rather than an oversight.

**Constraint #3 — flagged to the teammate before this ships.** Everything in
step 5 changes write behaviour for the Android app:
- product insert/update now requires `seller_id = current_seller_id()`
- enquiry insert by a *signed-in* buyer now requires a resolvable profile
- any request still sending only the anon key starts returning empty

None of it is safe to drop until the app is confirmed to propagate the JWT.

## Phase 6 — `orders` / `messages`

Unchanged from `orders-messages-rls-draft.md`. Apply only after phase 5 is
verified. Its five open questions still need answers — question 1 in particular:
there is no admin role in this schema, so the moderation desk gets no access
from these policies.

---

## Open item #5 — the `enquiries` check constraint

**A precise answer requires reading the constraint, and that read is blocked**
with the rest of phase 1. What is needed is the definition itself, not an
inference:

```sql
select con.conname, pg_get_constraintdef(con.oid) as definition
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace ns on ns.oid = rel.relnamespace
 where ns.nspname='public' and rel.relname='enquiries' and con.contype='c';

select column_name, is_nullable, column_default
  from information_schema.columns
 where table_schema='public' and table_name='enquiries'
 order by ordinal_position;
```

Then settle it empirically rather than by reading the definition alone — a CHECK
that is NULL-tolerant passes on `UNKNOWN`, which is the exact trap this question
is about:

```sql
-- expect: violates check constraint. If it INSERTS, the constraint does not
-- cover this case and the Android app has no guardrail.
begin;
insert into public.enquiries (product_id, message)
values ('<a real product id>', 'constraint probe');
rollback;
```

The `begin/rollback` is why this is safe to run inside the read-only phase.

**Shape of the answer to take to the teammate**, to be filled in from the above:
*"An insert sending neither `buyer_id` nor guest contact fields is
REJECTED / ACCEPTED by constraint `<name>`, defined as `<def>`."* If accepted,
the guest-contact work from `20260910072905` has a gap — rows can land with no
way to contact anyone — worth fixing in the same window.

---

## What is needed to proceed

1. **Re-authorize the Supabase connector** (or provide a service-role key).
   Phases 1–2 are pure reads and can run immediately once it is back.
2. **Confirm the Android app already created real `auth.users`.** If yes, the
   Admin-API user-creation step in migration plan §3 is dropped entirely.
3. **Pick the orphan policy** for direction (a) — leave unmapped, or mint.
4. Everything after phase 2 waits for review of the phase-2 output.
