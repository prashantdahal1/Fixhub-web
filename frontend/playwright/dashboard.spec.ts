import { test, expect } from '@playwright/test';

test('dashboard metrics render', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.route('**/api/v1/admin/users**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.goto('/admin', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Live Admin Console')).toBeVisible();
});
