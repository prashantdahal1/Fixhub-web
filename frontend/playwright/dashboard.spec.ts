import { test, expect } from '@playwright/test';

test('dashboard metrics render', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    document.cookie = 'auth_token=test-token; path=/';
    document.cookie = 'user_data=' + encodeURIComponent(JSON.stringify({ name: 'Admin User', email: 'admin@fixhub.com' })) + '; path=/';
  });
  await page.route('**/api/v1/auth/whoami', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'admin@fixhub.com', role: 'admin', firstName: 'Admin', lastName: 'User' } }) }));
  await page.route('**/api/v1/admin/users**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) }));
  await page.route('**/api/v1/services?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) }));
  await page.route('**/api/v1/bookings', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.route('**/api/v1/tickets/admin', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.goto('/admin', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Live Admin Console')).toBeVisible();
});
