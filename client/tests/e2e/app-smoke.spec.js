import { expect, test } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('TravelAI Planner').first()).toBeVisible();
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login to TravelAI Planner' })).toBeVisible();
});

test('admin route redirects unauthenticated users', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/login/);
});
