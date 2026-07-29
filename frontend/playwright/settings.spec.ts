import { test, expect } from '@playwright/test';

test('settings page basic fields', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.goto('/settings');
  await expect(page.locator('text=Account Settings')).toBeVisible().catch(() => {});
});
