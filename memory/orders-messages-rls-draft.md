# `orders_all` / `messages_all` RLS fix — DRAFT, NOT APPLIED

*Drafted 2026-09-10 · Project `imprsuvtgqxepwzimqmc` · KalaCart / SIH26090*
*Status: **draft only**. Nothing applied. No policy created, altered or dropped.*

Companion to [auth-migration-plan.md](auth-migration-plan.md) — this fix
**cannot be applied until the `auth_user_id` bridge in §2 of that plan exists.**
See "Blocked on" below.

---

## Current state

| Table | Policy | Cmd | Roles | USING | WITH CHECK |
|---|---|---|---|---|---|
| `orders` | `orders_all` | ALL | `authenticated` | `true` | `true` |
| `messages` | `messages_all` | ALL | `authenticated` | `true` | `true` |

Any signed-in user can read, modify and delete **every order and every private
message in the system**. Of everything in this database these two are the most
sensitive: orders carry `shipping_address`, `total_amount` and `payment_status`;
messages are private artisan↔buyer correspondence with `media_url` attachments.

Both tables are currently empty (0 rows), so nothing has leaked yet. This is a
pre-launch fix, not an incident.

## Relevant shape

- `orders.buyer_id` → `buyers(id)`, `orders.seller_id` → `sellers(id)`, both `NOT NULL`
- `messages.sender_id` / `messages.receiver_id` → `profiles(id)`, both `NOT NULL`
- `messages.enquiry_id` → nullable, links a thread to an enquiry

Note the asymmetry: **orders join through `sellers`/`buyers`, messages join
directly to `profiles`.** The two policies therefore need different helpers.

---

## ⚠️ Blocked on: the `auth_user_id` bridge

This is the same wall as everywhere else in this schema. `auth.uid()` returns
NULL for every real request, because the Android app authenticates against
Firebase and `profiles.id` is an unrelated `uuid_generate_v4()` value:

| Check | Value |
|---|---|
| `profiles` carrying a `firebase_uid` | 18 of 18 |
| `auth.users` rows | 1 |
| `profiles` matching an `auth.users` row | **0** |

**Applying the policies below before the bridge exists would deny all access to
both tables** — every predicate resolves through `auth.uid()`, which is NULL, so
every row fails every check. That is a safe failure mode (deny, not leak), but
it takes the feature offline rather than securing it.

**Correct order:** land §2–§3 of the migration plan (add `profiles.auth_user_id`,
create the real `auth.users`, backfill), verify `unmapped = 0`, ship the Android
JWT change, *then* apply this.

The helper functions below are the same ones proposed in §4 of the migration
plan — define them once, not twice.

---

## Proposed policies

```sql
-- NOT APPLIED — proposal only.
-- Prerequisite: public.current_profile_id() / current_seller_id() /
-- current_buyer_id() from auth-migration-plan.md §4 must exist first.

-- ============================================================
-- orders
-- ============================================================
drop policy if exists "orders_all" on public.orders;

-- Both parties to the order can see it. Nobody else.
create policy "Order parties read own orders" on public.orders
  for select to authenticated
  using (
    buyer_id  = public.current_buyer_id()
    or seller_id = public.current_seller_id()
  );

-- Only the buyer creates an order, and only as themselves.
create policy "Buyer creates own order" on public.orders
  for insert to authenticated
  with check (buyer_id = public.current_buyer_id());

-- The seller drives fulfilment (order_status); the buyer may cancel.
-- Neither may reassign the order to a different party — the WITH CHECK
-- re-asserts the same ownership the USING clause tested.
create policy "Seller updates own orders" on public.orders
  for update to authenticated
  using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

create policy "Buyer updates own orders" on public.orders
  for update to authenticated
  using (buyer_id = public.current_buyer_id())
  with check (buyer_id = public.current_buyer_id());

-- No DELETE policy: orders are financial records. Cancellation is a
-- status transition, not a row removal. Deliberate omission.

-- ============================================================
-- messages
-- ============================================================
drop policy if exists "messages_all" on public.messages;

-- Either participant can read the thread.
create policy "Participants read own messages" on public.messages
  for select to authenticated
  using (
    sender_id   = public.current_profile_id()
    or receiver_id = public.current_profile_id()
  );

-- You may only send as yourself.
create policy "Sender sends own messages" on public.messages
  for insert to authenticated
  with check (sender_id = public.current_profile_id());

-- Narrow update path: this exists so the RECEIVER can flip is_read.
-- Postgres RLS cannot restrict which COLUMN is updated, so this policy
-- lets the receiver rewrite message text too. See "Open questions".
create policy "Receiver marks messages read" on public.messages
  for update to authenticated
  using (receiver_id = public.current_profile_id())
  with check (receiver_id = public.current_profile_id());

-- No DELETE policy: neither party can delete correspondence.
-- Revisit if the product needs "delete for me". Deliberate omission.
```

---

## Verification before trusting it

Run as a real signed-in user once the bridge exists — a policy that silently
denies everything looks identical to one that works, until someone tries to use
the app:

```sql
-- expect: only rows where the caller is buyer or seller
select count(*) from public.orders;
-- expect: only threads the caller participates in
select count(*) from public.messages;
-- expect: failure
insert into public.orders (product_id, buyer_id, seller_id, quantity, unit_price, total_amount)
values ('<some product>', '<someone else''s buyer id>', '<seller>', 1, 100, 100);
```

Rollback is one statement per table if anything breaks:

```sql
create policy "orders_all" on public.orders for all using (true) with check (true);
create policy "messages_all" on public.messages for all using (true) with check (true);
```

---

## Open questions for review

1. **Admin access.** These policies give admins nothing. The moderation desk
   presumably needs to read orders and possibly messages. There is no admin role
   in this schema today (`profiles.role` holds only `seller` / `buyer`). Adding
   one is a prerequisite for an admin-facing orders view — worth deciding before
   this lands, not after.
2. **`is_read` and column-level scope.** RLS gates rows, not columns. The
   receiver-update policy is there for read receipts but also permits editing
   the message body. If that matters, move `is_read` to a
   `SECURITY DEFINER` function that only touches that column, and drop the
   update policy entirely.
3. **Buyer update scope.** "Buyer updates own orders" lets a buyer change
   `order_status` to anything the CHECK constraint allows, including
   `delivered`. If only cancellation should be buyer-driven, that needs a
   trigger enforcing legal transitions — RLS cannot express it.
4. **A user who is both buyer and seller.** Ananya has both a `sellers` and a
   `buyers` row. The `or` in the read policies handles this correctly, but
   `current_seller_id()` / `current_buyer_id()` each `limit 1`, so a profile
   with two rows of the same kind would silently pick one. Not currently
   possible, worth a unique index to keep it that way.
5. **Guest enquiries have no equivalent here.** Unlike `enquiries`, orders and
   messages have `NOT NULL` party columns, so there is no anonymous path to
   preserve. Confirming that matches the product intent.
