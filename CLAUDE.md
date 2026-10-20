# Project rules

## Database: new tables need explicit Supabase grants

Since 2026-10-30, Supabase no longer grants Data API (PostgREST / supabase-py / supabase-js) access to new tables in `public` automatically. Existing tables are unaffected.

- Most server code uses SQLAlchemy over `POSTGRES_URL` (`server/db/session.py`), which connects directly to Postgres and does not need these grants.
- Some routes use the supabase-py client (`server/supabase_client.py`, e.g. `supabase.table(...)`) with the service role key. Those calls fail with "permission denied" on a new table that has no grant.

When an Alembic migration in `server/alembic/versions/` creates a new table, add the grant in the same migration's `upgrade()`:

```python
op.execute("grant select, insert, update, delete on public.<table> to service_role")
```

Grant to `service_role` only. Do not grant to `anon` or `authenticated`: the frontend does not use supabase-js, and those roles would expose the table through the public API.
