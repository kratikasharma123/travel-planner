# Testing Guide

## Commands

From the repository root:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

From `client/`:

```bash
npm run lint
npm run test -- --run
npm run test:coverage -- --run
npm run test:e2e
```

## Test coverage added

- Unit tests for admin analytics and export utilities
- RBAC helper tests for admin role/permission behavior
- Existing Playwright smoke coverage for public pages and unauthenticated admin redirect

## E2E requirements

Playwright starts the Vite dev server. Full authenticated admin journeys require a Supabase project with seeded test users:

1. Apply `supabase/schema.sql`.
2. Create a normal user and a manually promoted `super_admin`.
3. Put test-safe Supabase values in `client/.env`.
4. Run `npm run test:e2e --prefix client`.

## Manual accessibility checks

For admin pages, verify:

- All controls can be reached by keyboard.
- Focus states are visible.
- Tables have readable column headings.
- Modal close buttons are reachable and labelled.
- Error messages use alert semantics where appropriate.
- Text remains readable on mobile and desktop breakpoints.
