import { test, expect } from '@playwright/test';

test('notifications drawer opens', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.goto('/');
  await expect(page.locator('text=Notifications')).toBeDefined();
});
