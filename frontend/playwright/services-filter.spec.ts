import { test, expect } from '@playwright/test';

test('services page category filter works', async ({ page }) => {
  await page.route('**/api/v1/services**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) }));
  await page.goto('/dashboard/services');
  await expect(page.locator('button:has-text("All Services")')).toBeVisible();
  await page.click('button:has-text("Electrician")');
  await expect(page.locator('text=No services found.')).toBeVisible();
});
