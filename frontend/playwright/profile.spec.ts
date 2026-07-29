import { test, expect } from '@playwright/test';

test('profile page renders', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.route('**/api/v1/auth/whoami', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'a@b', firstName: 'A', lastName: 'B', role: 'customer' } }) }));
  await page.goto('/dashboard/profile');
  await expect(page.locator('h1')).toContainText('My Profile');
});
