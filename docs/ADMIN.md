# Admin Panel Setup

## Overview

The admin panel runs at `/admin` and uses the existing Supabase Auth session. Access is enforced in two places:

1. Client route guard: `AdminRoute` checks the logged-in profile role/status.
2. Supabase RLS: `supabase/schema.sql` defines admin role and permission policies.

Supported admin roles are:

- `super_admin`
- `admin`
- `moderator`
- `support`

Normal users keep the `user` role.

## Manual Super Admin bootstrap

The first Super Admin is intentionally manual. Do not add service-role keys or privileged bootstrap logic to the browser client.

1. Register or invite the user through the normal app/Supabase Auth flow.
2. In Supabase SQL editor, promote the user by email:

```sql
update public.profiles
set role = 'super_admin', status = 'active', updated_at = now()
where id = (
  select id from auth.users where email = 'admin@example.com'
);
```

3. Log in with that account. Admin users are sent to `/choose-dashboard`, where they can choose **Open Admin Panel** or **Continue as User**.
4. You can also visit `/admin` directly after login.

## Admin capabilities

The current admin module includes:

- Dashboard overview cards and charts
- User search/filter/status/role management
- Trip, booking, AI usage, content, notification, support, review, settings, and audit-log sections
- CSV exports
- JSON-based create flows for admin-managed records
- Status update and delete actions where the user's role has write permission
- Audit logging for admin write actions

Some provider-specific capabilities are modeled but not fully connected until providers are configured:

- Real payment revenue collection
- SMTP email delivery
- Push notification delivery
- PDF/XLSX report generation
- External monitoring dashboards

## Security notes

- Keep Supabase service-role keys out of `client/.env`.
- Run `supabase/schema.sql` after pulling admin changes so RLS policies are applied.
- Use Supabase dashboard/API for password recovery emails; the app calls Supabase password reset helpers.
- Use `super_admin` only for trusted operators because it can access settings and audit logs.
