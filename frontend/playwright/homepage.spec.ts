import { test, expect } from '@playwright/test';

test('homepage should show hero and service categories', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FixHub/i);
  await expect(page.locator('text=Home repairs, handled fast.')).toBeVisible();
  await expect(page.locator('a:has-text("View all services")')).toHaveCount(2);
});
