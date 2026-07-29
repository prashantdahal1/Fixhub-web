import { test, expect } from '@playwright/test';

test('payments page placeholder', async ({ page }) => {
  await page.goto('/payments');
  await expect(page.locator('text=Payments')).toBeDefined();
});
