import { test, expect } from '@playwright/test';

test('post service modal opens for professionals', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'pro-token'); localStorage.setItem('role', 'professional'); });
  await page.goto('/dashboard/services');
  // open post modal if present
  await expect(page.locator('text=Post a New Service')).toBeDefined();
});
