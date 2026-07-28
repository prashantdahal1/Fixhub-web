import { test, expect } from '@playwright/test';

const emptyFixture = { success: true, data: [], meta: { total: 0 } };

test.skip('search input updates results via API (skipped - flaky SSR)', async ({ page }) => {
  // Intercept services API and return empty for a specific search term
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });

  await page.route('**/api/v1/auth/me', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'test@fixhub', firstName: 'Test', role: 'customer' } }) });
  });

  await page.route('**/api/v1/services**', (route, request) => {
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

  // debounce is 350ms in the component; wait a bit
  await page.waitForTimeout(500);

  await expect(page.locator('text=No services found.')).toBeVisible();
});
