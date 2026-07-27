import { test, expect } from '@playwright/test';

test.describe('Homepage E2E Tests', () => {
  test('homepage should show hero title and navigation header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FixHub/i);
    await expect(page.locator('text=Home repairs, handled fast.')).toBeVisible();
  });

  test('homepage should display call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a:has-text("View all services")')).toBeVisible();
  });

  test('homepage should render category showcase cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
