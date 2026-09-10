# Supabase support request — DRAFT (not sent)

*Drafted 2026-09-10 · Project `imprsuvtgqxepwzimqmc` (ap-south-1, Postgres 17.6.1.166) · KalaCart / SIH26090*

Two requests, both blocked on the same boundary: operations that require
`supabase_admin`, which the project's `postgres` role is neither a member of
nor a superuser on (`rolsuper = false`,
`pg_has_role('postgres','supabase_admin','USAGE') = false`).

---

## Subject

Two `supabase_admin`-level operations: revoke EXECUTE on PostGIS
`st_estimatedextent`, and relocate the `postgis` extension out of `public`

## Body

Hi — we have two related items on project `imprsuvtgqxepwzimqmc` that we cannot
complete ourselves because they require `supabase_admin`. Both were surfaced by
the built-in security advisor. We have verified each limitation directly rather
than assuming it; details below so you can skip the diagnosis.

### Request 1 — REVOKE EXECUTE on `public.st_estimatedextent` (3 overloads)

The security advisor reports lints 0028 and 0029 against all three overloads:

- `public.st_estimatedextent(text, text)`
- `public.st_estimatedextent(text, text, text)`
- `public.st_estimatedextent(text, text, text, boolean)`

Each is `SECURITY DEFINER` and executable by `anon` and `authenticated` via
`/rest/v1/rpc/st_estimatedextent`.

**Please run, as `supabase_admin`:**

```sql
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text,text)
  FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text,text,text)
  FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text,text,text,boolean)
  FROM public, anon, authenticated;
```

**What we already tried, and why it silently failed.** We ran exactly the above
as `postgres`, both via ad-hoc SQL and as a recorded migration
(`20260910071921_revoke_public_execute_on_st_estimatedextent`). Both reported
success. Neither had any effect:

- `pg_proc.proacl` remained byte-identical, still `anon=X/supabase_admin`
- `has_function_privilege('anon', oid, 'EXECUTE')` still returns `true`
- the advisor, re-run fresh (`observed_at` moved 06:56 → 07:19), still reports
  all three overloads

The cause is that the functions are owned by `supabase_admin` and every grant
was issued *by* `supabase_admin`; PostgreSQL silently ignores a `REVOKE` for
grants the issuing role did not make. We have left the no-op migration in
history with a follow-up documentation migration explaining it, rather than
deleting the row.

We also considered removing `public` from PostgREST's exposed schemas as a
workaround and rejected it: all 17 application relations live in `public`, so
that would take the entire REST API offline for our Android client.

### Request 2 — Relocate the `postgis` extension out of `public`

Advisor lint 0014 (`extension_in_public`) reports `postgis` 3.3.7 installed in
`public`. This is also the root of lint 0013 (`rls_disabled_in_public`) against
`public.spatial_ref_sys`.

**Please either** temporarily mark the extension relocatable and move it:

```sql
-- as supabase_admin
UPDATE pg_extension SET extrelocatable = true WHERE extname = 'postgis';
ALTER EXTENSION postgis SET SCHEMA extensions;
UPDATE pg_extension SET extrelocatable = false WHERE extname = 'postgis';
```

**or** advise if you would rather we do a `DROP EXTENSION postgis CASCADE` /
`CREATE EXTENSION postgis SCHEMA extensions` cycle and rebuild the dependent
objects ourselves.

**What we already tried.** `ALTER EXTENSION postgis SET SCHEMA extensions`
fails with `0A000 — extension "postgis" does not support SET SCHEMA` (PostGIS
has been non-relocatable since 2.3). The narrower fallback,
`ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY`, fails with
`42501 — must be owner of table spatial_ref_sys`. Both attempts were run inside
transactions we rolled back; the project was never left in a partial state.

**Dependent objects, if a drop/recreate is the route.** We would need to
rebuild:

- `public.sellers.location` — `geography(Point,4326)`, 4 of 4 rows populated
- `idx_seller_location` — `CREATE INDEX ... USING gist (location)`
- `public.update_seller_location()` and its `BEFORE INSERT OR UPDATE` trigger
  `trg_update_location` on `sellers`

One caveat we would want to fix in the same window either way:
`update_seller_location()` calls `ST_SetSRID`/`ST_MakePoint` and casts
`::geography` with **no `SET search_path`**, so it resolves those names from the
caller's `search_path` at runtime. It currently works only because PostGIS is in
`public`. After a move it would depend on the inherited database default
(`"$user", public, extensions`) happening to include `extensions` — which is
luck, not design. We intend to pin it to
`SET search_path = extensions, public` and schema-qualify the calls.

### Environment

- Project ref: `imprsuvtgqxepwzimqmc` (region ap-south-1)
- Postgres 17.6.1.166, PostGIS 3.3.7, GEOS 3.14.1, PROJ 9.7.1
- Extensions in `public`: `postgis` (876 dependent objects)
- Stage: pre-launch, shared backend between a web front-end and an Android app

Thanks —
Rishi Ventrapragada, KalaCart

---

## Not included on purpose

- The 7 `rls_enabled_no_policy` tables — ours to fix, no admin rights needed.
- Leaked-password protection — a dashboard toggle.
- The Firebase-auth/RLS mismatch — an architecture decision on our side.
