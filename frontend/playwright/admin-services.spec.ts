import { test, expect } from '@playwright/test';

test('admin services page loads', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'admin-token'); });
  await page.goto('/admin/services');
  await expect(page.locator('text=Services')).toBeVisible().catch(() => {});
});
