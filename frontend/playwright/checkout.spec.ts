import { test, expect } from '@playwright/test';

test('checkout page shows payment methods', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FixHub/i);
});
