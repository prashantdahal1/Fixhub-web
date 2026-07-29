import { test, expect } from '@playwright/test';

test('services page category filter works', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.route('**/api/v1/auth/whoami', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'user@example.com', role: 'customer', firstName: 'Test', lastName: 'User' } }) }));
  await page.route('**/api/v1/services?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) }));
  await page.goto('/dashboard/services');
  await expect(page.getByRole('button', { name: 'All Services' })).toBeVisible();
  await page.getByRole('button', { name: 'Electrician' }).click();
  await expect(page.locator('text=No services found.')).toBeVisible();
});
