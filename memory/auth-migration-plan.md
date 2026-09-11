# Firebase → Supabase Auth migration plan — DRAFT FOR REVIEW

*Drafted 2026-09-10 · Project `imprsuvtgqxepwzimqmc` · KalaCart / SIH26090*
*Status: **planning only**. Nothing in this document has been applied. No RLS
policy was touched, no `*_all` policy dropped, no `profiles`/`sellers` row
modified.*

---

## 0. Why this exists

`auth.uid()` returns NULL for every real request today. The Android app
authenticates against **Firebase**, and `profiles.id` is an independent
`uuid_generate_v4()` value with no relationship to `auth.users.id`.

Measured, not assumed:

| Check | Value |
|---|---|
| `profiles` rows | 18 |
| …carrying a `firebase_uid` | **18 of 18** |
| `auth.users` rows | **1** (`eshwarvjit1@gmail.com`, provider `email`) |
| `profiles` whose `id` matches an `auth.users` row | **0** |
| `sellers.id` matching an auth uid | **0** |

Consequence: the four scoped policies on `products` (`seller_id = auth.uid()`)
match nothing and never have. The permissive `*_all` policies are the only
thing currently granting the Android app access — which is why they must not be
dropped before this migration lands.

---

## 1. The data is mostly test fixtures — read this first

**13 of the 18 profiles are synthetic.** They carry `fb_live_*` firebase UIDs,
`*@test.kalacart.com` emails with unix-ms timestamps, and the literal names
"Live Verification Buyer" / "Live Verification Artisan".

**Only 5 profiles are real people:**

| Name | Role | Email | Phone | Child rows |
|---|---|---|---|---|
| Eshwar | buyer | eshwarvjit1@gmail.com | 9440156395 | buyer ×1 |
| Shruti | seller | shrutiprasadam@gmail.com | 9951162750 | seller ×1 |
| Sanjay | seller | sanjayvjit.123@gmail.com | 7569322989 | seller ×1 |
| Ananya | seller | challaananya@gmail.com | 8547152415 | seller ×1, buyer ×1 |
| Nidhi | seller | nidhi17@gmail.com | 6696854665 | seller ×1 |

This reframes the whole exercise: it is a **5-row import**, not an 18-row one.

**Decision needed before anything runs:** are the 13 fixtures deleted, or
migrated too? Recommendation: delete them in a separate, earlier change. They
inflate every count, they own 5 of the 9 `sellers` rows, and migrating them
means minting 13 junk `auth.users` entries. *(Not actioned — flagged for your
call.)*

### The phone-number trap

Phone is **not** globally unique in this table: 7 profiles share
`+919876543210` and 6 share `+919123456780`. Both clusters are **entirely
within the test fixtures**. The 5 real users have 5 distinct phones.

So: phone is unusable as an identity key across the table as it stands, but
becomes usable once the fixtures are removed. **Email is clean either way**
(18 distinct across 18 rows) and is the safer import key.

### Two orphan profiles

`2696a76b…` (buyer) and `340c2420…` (seller) have no `buyers`/`sellers` child
row at all. Both are fixtures. Cleanup will drop them.

---

## 2. `profiles.id` cannot be re-keyed in place

The obvious approach — update `profiles.id` to equal the new `auth.users.id` —
is blocked. **All 12 inbound foreign keys are `ON UPDATE NO ACTION`:**

| Child table | Column | → Parent |
|---|---|---|
| `sellers` | `profile_id` | `profiles(id)` |
| `buyers` | `profile_id` | `profiles(id)` |
| `messages` | `sender_id`, `receiver_id` | `profiles(id)` |
| `product_views` | `user_id` | `profiles(id)` |
| `search_history` | `user_id` | `profiles(id)` |
| `user_preferences` | `user_id` | `profiles(id)` |
| `verification_requests` | `seller_id` | **`profiles(id)`** ⚠️ |
| `products` | `seller_id` | `sellers(id)` |
| `orders` | `seller_id` | `sellers(id)` |
| `orders` | `buyer_id` | `buyers(id)` |
| `enquiries` | `buyer_id` | `buyers(id)` |

Every one is `ON DELETE CASCADE`, `ON UPDATE NO ACTION`. Updating a
`profiles.id` therefore raises a FK violation rather than cascading.

> ⚠️ **Schema inconsistency worth fixing in the same window:**
> `verification_requests.seller_id` points at **`profiles(id)`**, while
> `products.seller_id` and `orders.seller_id` point at **`sellers(id)`**. Same
> column name, two different meanings. Any policy written against
> "seller_id" must know which. This is a latent bug independent of auth.

### Recommended approach: add a column, don't re-key

Leave `profiles.id` alone. Add a nullable `auth_user_id uuid` referencing
`auth.users(id)`, backfill it, and write policies against *that*.

Advantages: no FK churn, no downtime, reversible, and both auth systems can
coexist during the Android rollout.

```sql
-- NOT APPLIED — proposal only
alter table public.profiles
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists idx_profiles_auth_user_id
  on public.profiles (auth_user_id) where auth_user_id is not null;
```

---

## 3. Import sequence (proposed, not applied)

Run against a **branch or a restored copy first**, never straight at prod.

1. **Clean up fixtures** (separate prior change, pending your decision).
2. **Create `auth.users` entries for the 5 real profiles.** Must go through the
   Admin API (`supabase.auth.admin.createUser`) or the dashboard — direct
   `INSERT INTO auth.users` skips identity/credential setup and produces users
   that cannot sign in. Key on **email**.
   *STRUCK 2026-09-11 — do not mint auth.users. See
   memory/auth-bridge-execution-plan.md, Phase 1.*
3. **Backfill the join:**
   ```sql
   -- NOT APPLIED — proposal only
   update public.profiles p
      set auth_user_id = u.id
     from auth.users u
    where lower(btrim(p.email)) = lower(btrim(u.email))
      and p.auth_user_id is null;
   ```
4. **Verify before any policy change:**
   ```sql
   select count(*) filter (where auth_user_id is null) as unmapped,
          count(*) filter (where auth_user_id is not null) as mapped
     from public.profiles;
   ```
   Proceed only when `unmapped` covers exactly the rows you intended to leave
   behind.
5. **Keep `firebase_uid`.** It is the rollback path and the audit trail. Do not
   drop it in this migration.

---

## 4. Corrected RLS policies (proposed, not applied)

These replace the broken `seller_id = auth.uid()` comparisons with the real
chain: `auth.uid()` → `profiles.auth_user_id` → `profiles.id` →
`sellers.profile_id` → `sellers.id` → `products.seller_id`.

Two helper functions keep the policies readable and the joins in one place:

```sql
-- NOT APPLIED — proposal only
create or replace function public.current_profile_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select p.id from public.profiles p where p.auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_seller_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select s.id from public.sellers s
   where s.profile_id = public.current_profile_id() limit 1;
$$;

create or replace function public.current_buyer_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select b.id from public.buyers b
   where b.profile_id = public.current_profile_id() limit 1;
$$;
```

*(Note: these are `SECURITY DEFINER` and would need `REVOKE EXECUTE ... FROM
anon` — see the advisor lints 0028/0029 we already hit on
`st_estimatedextent`. Grant to `authenticated` only.)*

### products

```sql
-- NOT APPLIED — proposal only
drop policy if exists "products_all" on public.products;

-- Buyers see approved stock only; sellers always see their own.
drop policy if exists "Anyone reads products" on public.products;
create policy "Public reads approved products" on public.products
  for select to anon, authenticated
  using (status = 'approved' or seller_id = public.current_seller_id());

drop policy if exists "Seller inserts product" on public.products;
create policy "Seller inserts own product" on public.products
  for insert to authenticated
  with check (seller_id = public.current_seller_id());

drop policy if exists "Seller updates own product" on public.products;
create policy "Seller updates own product" on public.products
  for update to authenticated
  using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

drop policy if exists "Seller deletes own product" on public.products;
create policy "Seller deletes own product" on public.products
  for delete to authenticated
  using (seller_id = public.current_seller_id());
```

> **Moderation note:** `status = 'approved'` in the read policy is what makes
> the Increment-17 moderation real. Without dropping `products_all`, the status
> column is decorative — anyone can read and write any row regardless.

### sellers / buyers / profiles

```sql
-- NOT APPLIED — proposal only
drop policy if exists "sellers_all" on public.sellers;
create policy "Public reads sellers" on public.sellers
  for select to anon, authenticated using (true);
create policy "Seller updates own record" on public.sellers
  for update to authenticated
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

drop policy if exists "buyers_all" on public.buyers;
create policy "Buyer reads own record" on public.buyers
  for select to authenticated using (profile_id = public.current_profile_id());
create policy "Buyer updates own record" on public.buyers
  for update to authenticated
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

drop policy if exists "profiles_all" on public.profiles;
-- the three existing scoped profile policies also need auth.uid() = id
-- rewritten to auth.uid() = auth_user_id
```

### enquiries — note the guest case

`enquiries_all` cannot simply be dropped: the guest-contact path added in
`20260910072905` means anonymous users legitimately insert rows with a NULL
`buyer_id`.

```sql
-- NOT APPLIED — proposal only
drop policy if exists "enquiries_all" on public.enquiries;

create policy "Anyone creates an enquiry" on public.enquiries
  for insert to anon, authenticated with check (true);

create policy "Seller reads enquiries on own products" on public.enquiries
  for select to authenticated
  using (product_id in (select id from public.products
                         where seller_id = public.current_seller_id()));

create policy "Buyer reads own enquiries" on public.enquiries
  for select to authenticated
  using (buyer_id = public.current_buyer_id());
```

Open question for review: a guest who submits an enquiry can never read it back
(no identity to match on). That is probably correct for a linkage model, but it
should be a deliberate choice.

### Also outstanding

`orders_all` and `messages_all` are `USING (true)` for `authenticated` — any
signed-in user can read every order and every message in the system. Not in
scope for this document, but they are the most sensitive of the set and should
be scoped in the same pass.

The 7 tables with RLS enabled and **zero** policies (`categories`,
`product_images`, `product_views`, `search_history`, `user_preferences`,
`verification_requests`, `wholesale_pricing`) are currently deny-all. They will
need real policies the moment the Android app touches them.

---

## 5. Android-side changes — for teammate review

*Not built, not scoped by me. This is the surface I can infer from the database;
treat it as a checklist to verify against the actual client, not a spec.*

1. **Swap the auth SDK.** Firebase Auth → `supabase-kt` (or the REST auth
   endpoints). Sign-in, sign-up, session restore, sign-out, token refresh.
2. **Token propagation.** Every PostgREST call must carry the Supabase JWT as
   `Authorization: Bearer <access_token>`. Today the app almost certainly sends
   only the anon key — which is exactly why `auth.uid()` is NULL and why the
   `*_all` policies are load-bearing.
3. **Profile creation on signup.** A new `auth.users` row needs a matching
   `profiles` row with `auth_user_id` set. Cleanest as a
   `on auth.users insert` trigger server-side, so the client cannot skip it.
4. **Stop writing `firebase_uid`** for new users; keep reading it during the
   transition window.
5. **Re-test every write path** once `*_all` is dropped — product create/edit,
   enquiry submit, order placement, chat. Each will start failing loudly if the
   JWT is missing or the profile join is unset.
6. **Session migration UX.** Existing users are signed into Firebase and will be
   signed out by the switch. Either force a one-time re-login (simplest) or run
   a dual-auth window where the app accepts either token.
7. **Phone auth (if adopted — see §6).** Different sign-in flow entirely: OTP
   request + verify, not password. Affects onboarding screens.

**Highest-risk item:** #2. If the app ships without JWT propagation and the
`*_all` policies are dropped, every request returns empty and the app appears
to lose all its data.

---

## 6. Phone / SMS auth status

**Not enabled.** Verified in-database:

| Check | Value |
|---|---|
| Providers in use (`auth.identities`) | **`email`** only |
| `auth.identities` with provider `phone` | **0** |
| `auth.users` with a non-null `phone` | **0** |
| Phone MFA factors | **0** |
| Total `auth.users` | 1 |

The single auth user signed up with email. No phone provider has ever been
configured on this project.

### What enabling it requires

1. **A third-party SMS provider account.** Supabase does not send SMS itself —
   it relays through **Twilio, Twilio Verify, MessageBird, Vonage, or TextLocal**
   (TextLocal is community-supported). You supply the account SID / API key /
   sender ID. WhatsApp is available as an OTP channel, but **only** via Twilio
   or Twilio Verify.
2. **Dashboard config:** Authentication → Providers → Phone, enable, paste the
   provider credentials, set OTP expiry and rate limits.
   Defaults worth changing: **OTP expiry is 60 seconds**, which is usually too
   short in production (artisans on poor signal will miss it), and the global
   send limit defaults to **30 SMS/hour** across the whole project — low enough
   to throttle a demo day.
3. **DLT registration for India.** ⚠️ This is the one people miss. Indian
   carriers require sender IDs and message templates to be pre-registered under
   TRAI's DLT regime. Expect **days, not minutes**, and paperwork tied to a
   registered business entity. For a Ministry-facing SIH deliverable this is
   likely the long pole.
4. **Cost.** Provider-billed, not Supabase-billed. Indian A2P SMS runs roughly
   ₹0.12–0.25 per message plus carrier/DLT fees; Twilio Verify prices per
   verification instead. Budget for retries — real OTP flows send 1.3–1.5
   messages per successful login. Supabase's own quota is on auth MAUs, not SMS.

**Not configured. No provider account created. No credentials entered.**

### Recommendation

Given DLT lead time, don't put phone auth on the SIH critical path. Email +
password gets the auth migration done now; phone can be added later as an
additional provider without redoing any of §1–§4. If phone sign-in is a hard
product requirement for artisan onboarding (plausible — many artisans have a
phone but not an email), start the DLT registration **in parallel, today**,
because it will outlast the code work.

---

## 7. Suggested order of operations

1. Decide the fixture question (§1) — blocks everything.
2. Delete fixtures (separate change).
3. Add `profiles.auth_user_id` (§2).
4. Create the 5 `auth.users` via Admin API; backfill; verify (§3).
   *STRUCK 2026-09-11 — do not mint auth.users. See
   memory/auth-bridge-execution-plan.md, Phase 1.*
5. Android: JWT propagation shipped and verified **before** step 6.
6. Apply corrected policies, drop `*_all` (§4) — on a branch first.
7. Scope `orders_all` / `messages_all`; add policies for the 7 empty-policy
   tables.
8. Phone auth, only if DLT clears (§6).

Steps 1–4 are reversible. Step 6 is the one that can take the app down; it
should land behind a tested client, on a branch, with `products_all` recreatable
in one statement as the rollback.
