# Backup and Recovery

## Database backups

Use Supabase project backups for production databases. Before major schema changes:

1. Confirm automated backups are enabled for the Supabase project plan.
2. Export a manual backup or snapshot if available.
3. Apply `supabase/schema.sql` in staging first.
4. Verify RLS policies with normal user and admin accounts.

## File backups

If Supabase Storage is used for travel documents or uploads:

- Keep private buckets private.
- Periodically export critical files or use provider backup tooling.
- Document bucket names and retention requirements.

## Recovery procedure

1. Identify whether the failure is frontend, database, auth, or storage related.
2. Stop writes if corruption or accidental deletion is suspected.
3. Restore the last known-good database backup or apply a targeted SQL rollback.
4. Restore files from storage backup if needed.
5. Re-run smoke checks:
   - public landing page
   - login/register
   - dashboard
   - `/admin` access for Super Admin
   - RLS denial for normal users
6. Record the incident and corrective action in project notes.

## Admin audit logs

Admin actions are written to `admin_audit_logs` for supported admin writes. Use these logs to investigate user, content, settings, ticket, review, and notification changes.
