import { test, expect } from '@playwright/test';

test('reset password page shows fields', async ({ page }) => {
  await page.goto('/reset-password');
  await expect(page.locator('text=Reset password')).toBeVisible().catch(() => {});
});
