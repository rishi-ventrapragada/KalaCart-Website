# Auth bridge execution plan — FOR APPROVAL, NOT APPLIED

*Drafted 2026-09-11 · Project `imprsuvtgqxepwzimqmc` · KalaCart / SIH26090*
*Status (2026-09-11): **Phases 1, 2 and 4 applied.** Phase 3 decided. Phase 5
onward still unapplied — no policy has been created, altered or dropped.*

Supersedes the sequencing in `auth-migration-plan.md` §7 where the two differ.
The design there (add a column, do not re-key) still stands and is not revisited.

---

## 0. Status — connector live, phases 1, 2 and 4 have run

*Updated 2026-09-11. Supersedes the earlier blocker note, which said no Supabase
MCP tool was available and that every count below was the stale 2026-09-10 set.*

The connector is authorized. Phase 1 (inventory) and Phase 2 (match as SELECT)
have both run read-only; Phase 3 was decided by the owner; Phase 4 (backfill)
has been **applied by the owner in the Supabase SQL editor**. Results are
recorded inline under each phase below, and they replace the 2026-09-10 numbers
carried over from `auth-migration-plan.md`.

Headline: **3 of 3 remaining profiles are linked, 0 unmapped.** Open item #5 is
answered and closed. Two items remain before Phase 5 can proceed — the real-JWT
check on the app side, and a newly found two-join defect in the seller policies
(see the finding at the top of Phase 5).

---

## 1. What changed since the migration plan was written

`auth-migration-plan.md` opens on two premises that the handoff now contradicts:

| Premise in the plan (2026-09-10) | Measured 2026-09-11 |
|---|---|
| Android authenticates against **Firebase** | Migrated to **Supabase Auth** mid-project |
| 18 `profiles`, 13 of them test fixtures | **5** at start of Phase 1; fixtures gone |
| `auth.users` = 1 | **3**, all email, all confirmed |
| Plan §3: *create* the 5 auth users via Admin API | **Confirmed already created by the app.** The struck step stays struck. |

The last row is the one that mattered. Three real users had already registered
through the app; minting them via the Admin API would have produced a second
login per person and broken email uniqueness on the `auth.users` side — the exact
failure the strike was written to prevent.

This is the single most important correction. The plan's §3 says to *mint*
`auth.users` rows through the Admin API. If the Android app has already
registered these people, minting more creates **duplicate identities** — a
second login for the same human, and a match key that is no longer unique.

**Phase 1 must establish which world we are in before phase 2 matches anything.**

## 2. The match key — the whole risk

Three candidate predicates, ranked:

1. ~~**`firebase_uid` → `auth.users.raw_user_meta_data`.**~~ **RETIRED
   2026-09-11 — this key does not exist.** The `firebase_uid` column has been
   **dropped from `profiles` entirely** by the teammate, and no firebase uid
   appears anywhere in `auth.users.raw_user_meta_data`. There is no exact-UID
   path; note this also removed the rollback/audit trail that
   `auth-migration-plan.md` §3 item 5 said to preserve.
2. **Email — this is what was used.** 3 matched cleanly, no duplicates on
   either side. Compared as `lower(btrim(...))` on both sides.
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

### Phase 1 results — measured 2026-09-11

| Check | Result |
|---|---|
| `profiles` total (at start of phase 1) | **5** |
| `profiles.firebase_uid` | **column no longer exists** — dropped by the teammate |
| `profiles.auth_user_id` exists? | **Yes, already present** — FK to `auth.users`, full unique index |
| …populated? | **0 rows** — column existed but was entirely NULL |
| `auth.users` total | **3** |
| …with email / confirmed | **3 / 3** |
| firebase uid in `raw_user_meta_data` | **None** — neither `firebase_uid` nor `firebaseUid` |
| RLS enabled on all six tables | **Yes, all six** |
| `products` / `enquiries` / `orders` / `messages` row counts | **all empty** |

**Three findings worth carrying forward:**

1. **The column already existed, with a *full* unique index** — not the partial
   `where auth_user_id is not null` index this plan specified in Phase 4a. With
   0 rows populated the distinction was moot (NULLs are distinct under a plain
   unique index in Postgres, so multiple NULLs were legal either way), but it
   was pre-existing work recorded in neither document. The gate's "stop and
   reconcile" condition was **not** tripped, because the gate turns on the
   column being *populated*, and it was empty.
2. **`firebase_uid` is gone**, which retires match-key candidate 1 outright and
   also removes the audit trail `auth-migration-plan.md` §3 item 5 relied on.
   Email was the only usable key left.
3. **All four data tables are empty.** Nothing has leaked and nothing can be
   lost in the policy swap — Phase 5 is a pre-launch hardening exercise, not an
   incident response.

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

### Phase 2 results — measured 2026-09-11 · **GATE PASSED**

| Metric | Result |
|---|---|
| `matches_one` (email matched exactly one auth user) | **3** |
| `matches_zero` (no auth user) | **2** — Ananya, Nidhi (both sellers) |
| `matches_many` | **0** ✅ |
| Duplicate emails in `profiles` | **none** ✅ |
| Duplicate emails in `auth.users` | **none** ✅ |
| Auth users with no profile (2d, reverse direction) | **none** |

All three gate conditions held: `matches_many = 0` and both duplicate checks
returned zero rows. No profile was ambiguous, so constraint #1 — one person's
profile attaching to another person's login — was never in play.

The reverse direction being empty is its own small result: every `auth.users`
row had a matching profile, so orphan population (b) turned out not to exist.

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

### Phase 3 decision — 2026-09-11

**Population (b) was empty** (Phase 2d returned no rows), so only (a) needed a
call.

**Owner chose a third option: delete Ananya and Nidhi.** Neither "leave unmapped"
nor "mint an account" — the two profiles were removed, and both sellers will
re-register through the app. Applied in Phase 4 below.

The trade this accepts: deleting a profile cascades (all 12 inbound FKs are
`ON DELETE CASCADE`, per `auth-migration-plan.md` §2), so their seller rows went
with them. That was acceptable here **only because `products` is empty** — no
listing was destroyed. The same decision against a populated `products` table
would delete real catalogue data, so it should not be treated as reusable
precedent.

⚠️ **This decision depends on the teammate question below being answered "yes".**
If the Android app does not create the `profiles` row itself at signup, and no
trigger does it either, then Ananya and Nidhi **cannot come back** — they will
sign up, land an `auth.users` row, and have no profile. See the open question at
the end of this document.

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

### Phase 4 results — applied 2026-09-11 by the owner, in the Supabase SQL editor

| Step | Result |
|---|---|
| Profiles deleted (Phase 3 decision) | **2** — Ananya, Nidhi |
| …cascaded child rows | **2 `sellers`, 1 `buyers`** |
| Profiles backfilled | **3** |
| `unmapped` after backfill | **0** ✅ |
| Link correctness | **all 3 verified against the correct `auth.users` row** |

4a was a no-op: the column and a unique index already existed (Phase 1). The
backfill matched `matches_one = 3` from Phase 2b exactly, which is the check
that authorised the commit.

**⚠️ Phase 4 is not finished. 4c — the real-JWT verification — is still open.**

`unmapped = 0` proves the UPDATE wrote the rows it was meant to. It does **not**
prove `auth.uid()` resolves for a real request, and treating the row count as if
it did is precisely the silent failure this phase was written to catch. The half
that was actually broken is token propagation (`auth-migration-plan.md` §5 item
2) — the app sending only the anon key — and no SQL-side check can observe that.

**Owner:** to be verified by the teammate signing into the Android app and
confirming `auth.uid()` returns their uuid over PostgREST. Until that comes back,
Phase 5 must not start: every policy there resolves through `auth.uid()`, so
applying them against a client that does not send a JWT denies everything.

## Phase 5 — Policy swap: scoped on first, `*_all` dropped last

### ⚠️ Finding 2026-09-11: the live seller policies are off by two joins

`auth.uid()` **cannot be compared to `products.seller_id`.** They are values from
different tables, two joins apart:

```
auth.users.id
  = profiles.auth_user_id      (join 1 — the bridge backfilled in Phase 4)
      profiles.id
        = sellers.profile_id   (join 2 — products.seller_id references sellers.id,
                                          NOT profiles.id)
          sellers.id
            = products.seller_id
```

The three existing scoped policies — **"Seller inserts own product"**, **"Seller
updates own product"**, **"Seller deletes own product"** — test
`seller_id = auth.uid()` **directly**, skipping both joins. A seller's uuid in
`auth.users` is not their `sellers.id`, so the predicate compares two unrelated
uuids and **can never match a single row.** These policies have never worked and
never could; they have been inert since they were written, which is why the
permissive `*_all` policies are the only thing granting the app access today.

**Consequence for Phase 5: these three are marked for REPLACEMENT, not reuse.**
Do not leave them in place alongside the corrected policies on the assumption
that they are merely redundant. They are dead predicates, and keeping them would
leave three `drop policy` statements' worth of confusion behind for whoever reads
`pg_policies` next. Each is dropped by name and recreated against the helper.

The corrected chain lives in the helper functions, which resolve **both** joins
in one place — this is exactly why the plan uses helpers rather than inlining the
predicate into each policy:

```sql
-- join 1: auth.uid() -> profiles.id
create or replace function public.current_profile_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select p.id from public.profiles p where p.auth_user_id = auth.uid() limit 1;
$$;

-- join 2: profiles.id -> sellers.id. THIS is the value products.seller_id holds.
create or replace function public.current_seller_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select s.id from public.sellers s
   where s.profile_id = public.current_profile_id() limit 1;
$$;
```

The drafts in `auth-migration-plan.md` §4 already chain correctly and need no
change — the defect is in the **live** policies, not the proposals. What changes
here is that the three live policies are now known-broken rather than
assumed-fine, so the swap must drop them explicitly:

```sql
drop policy if exists "Seller inserts product"     on public.products;
drop policy if exists "Seller updates own product" on public.products;
drop policy if exists "Seller deletes own product" on public.products;
```

*(Confirm each policy's exact name against the Phase 1e listing before running —
names are matched literally and a near-miss silently drops nothing.)*

**One more thing this implies:** any future policy on a table whose `seller_id`
references `sellers(id)` owes both joins. `orders.seller_id` is the same shape
(Phase 6). And note the latent inconsistency flagged in
`auth-migration-plan.md` §2 — `verification_requests.seller_id` points at
**`profiles(id)`**, not `sellers(id)`, so a policy on that table needs
`current_profile_id()`, not `current_seller_id()`. Same column name, two
different meanings, and using the wrong helper fails silently in the same way
the three product policies already do.

---

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

## Open item #5 — the `enquiries` check constraint · ✅ CLOSED 2026-09-11

**Answer: REJECTED.** An insert sending neither `buyer_id` nor guest contact
fields is refused by the check constraint **`enquiries_buyer_or_guest_check`**.

Verified empirically, not inferred — a `begin / insert / rollback` probe sending
only `product_id` and `message` raised a check-constraint violation and was
rolled back. That distinction matters here: reading the definition alone would
not have settled it, because a NULL-tolerant CHECK passes on `UNKNOWN`, which is
the exact trap the question was about. The probe rules that out.

**For the teammate:** the guest-contact path from `20260910072905` has **no gap**.
The database will not accept an enquiry with no way to contact anybody, so the
Android app cannot create an unreachable row even if its client-side validation
misses. If the app *does* currently send such an insert, it is already failing
against this constraint and needs a client-side fix — but nothing unreachable can
have landed.

No action needed. Retained below for the record: the queries used, and the
original reasoning for why a definition read alone was insufficient.

---

*Original investigation notes:*

What is needed is the definition itself, not an inference:

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

*Rewritten 2026-09-11. Items 1–3 of the previous list are all resolved: the
connector was authorized, the app was confirmed to have created the real
`auth.users` rows, and the orphan policy was decided (delete).*

**Phase 5 is blocked on two things, both outside this repo:**

1. **Real-JWT verification (Phase 4c).** The teammate signs into the Android app
   and confirms `auth.uid()` returns their uuid over PostgREST. Until this comes
   back, applying Phase 5 against a client that sends only the anon key denies
   every request on all six tables. This is the highest-risk item in the whole
   migration (`auth-migration-plan.md` §5 item 2).
2. **Rewriting the three broken product policies** to resolve through both joins
   — see the finding at the top of Phase 5. They are dropped and recreated, not
   reused.

### Question for the teammate — blocks the Phase 3 deletions being recoverable

**There is no trigger creating a `profiles` row on `auth.users` insert.** So:
**does the Android app insert the `profiles` row itself at signup?**

- **If yes** — Ananya and Nidhi re-register in the app, get a fresh `auth.users`
  row and a fresh profile, and the Phase 3 decision is complete. Worth confirming
  the app also sets `auth_user_id` on that insert; if it leaves it NULL, they
  come back with a profile that is once again unbridged and every scoped policy
  is inert for them.
- **If no** — **they cannot come back.** They will sign up, land an `auth.users`
  row, and have no profile, no seller row, and no way to list products. Their old
  rows were deleted in Phase 4 and the cascade took their seller records with
  them. The fix would then be the `AFTER INSERT ON auth.users` trigger from
  `auth-migration-plan.md` §5 item 3 — a **write-path change**, therefore
  constraint #3, to be coordinated rather than shipped unilaterally.

This question should be answered **before** the teammate tells the two sellers to
re-register, not after.
