import { test, expect } from '@playwright/test';

test('services pagination shows page controls', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.route('**/api/v1/auth/whoami', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'user@example.com', role: 'customer', firstName: 'Test', lastName: 'User' } }) }));
  await page.route('**/api/v1/services?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 30 } }) }));
  await page.goto('/dashboard/services');
  await expect(page.locator('text=Page 1 of 3')).toBeVisible();
});
