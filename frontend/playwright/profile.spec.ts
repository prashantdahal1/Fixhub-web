import { test, expect } from '@playwright/test';

test('profile page renders', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('token', 'test-token'); });
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'a@b', firstName: 'A' } }) }));
  await page.goto('/profile');
  await expect(page.locator('text=Profile')).toBeVisible();
});
