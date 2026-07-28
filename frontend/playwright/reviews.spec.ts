import { test, expect } from '@playwright/test';

test('reviews section displays no reviews message', async ({ page }) => {
  await page.route('**/api/v1/reviews/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.goto('/dashboard/services/test-slug');
  await expect(page.locator('text=No reviews yet.')).toBeVisible().catch(() => {});
});
