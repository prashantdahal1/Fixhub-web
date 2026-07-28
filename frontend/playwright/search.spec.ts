import { test, expect } from '@playwright/test';

const emptyFixture = { success: true, data: [], meta: { total: 0 } };

test('search input updates results via API', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    document.cookie = 'auth_token=test-token; path=/';
  });

  await page.route('**/api/v1/auth/whoami', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'test@fixhub', firstName: 'Test', lastName: 'User', role: 'customer' } }) });
  });

  await page.route('**/api/v1/services?*', (route, request) => {
    const url = new URL(request.url());
    const search = url.searchParams.get('search') || '';
    if (search.toLowerCase().includes('noresults')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyFixture) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) });
    }
  });

  await page.goto('/dashboard/services', { waitUntil: 'networkidle' });
  await expect(page.locator('input[placeholder="Search services..."]')).toBeVisible({ timeout: 10000 });
  await page.fill('input[placeholder="Search services..."]', 'noresults-term');
  await page.waitForTimeout(500);
  await expect(page.locator('text=No services found.')).toBeVisible();
});
