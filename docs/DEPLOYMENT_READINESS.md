# Deployment Readiness

The website is not being deployed right now. This document captures production-readiness steps for when deployment is approved later.

## Current readiness

- Vite production build through `npm run build`.
- GitHub Actions CI for install, lint, unit tests, build, and npm audit.
- Optional Playwright smoke tests on pull requests.
- Environment variables are documented in `client/.env.example`.
- Admin access uses Supabase Auth + RLS; no service-role secrets are used in the frontend.

## Environment variables

Client-side variables must be browser-safe:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WEATHER_API_KEY=optional-weatherapi-key
VITE_MAPS_API_KEY=optional-browser-safe-maps-key
VITE_APP_ENV=production
VITE_APP_URL=https://your-production-domain.example
VITE_ENABLE_ADMIN_ANALYTICS=true
VITE_MONITORING_DSN=
```

Never expose Supabase service-role keys, SMTP passwords, or AI provider secrets in Vite variables.

## Future deploy targets

When deployment is approved, choose a frontend host such as Vercel, Netlify, or another static host. A host-specific deploy job should only be added after the target is selected.

## Rollback process

1. Revert the frontend deployment to the previous successful artifact/release in the chosen host.
2. If a schema migration caused the issue, apply a tested rollback SQL script or restore a Supabase backup.
3. Confirm `/`, `/login`, `/dashboard`, and `/admin` behavior.
4. Review admin audit logs and browser/error logs for impact.

## Monitoring readiness

Until a provider is chosen, use:

- CI build/test status
- Browser console checks during manual QA
- Supabase logs for auth/database errors
- Admin audit logs for admin actions

Future provider hooks can be added for Sentry, LogRocket, Datadog, or platform-native monitoring.
