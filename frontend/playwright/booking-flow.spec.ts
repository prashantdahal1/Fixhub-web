import { test, expect } from '@playwright/test';

test('basic booking flow UI elements present', async ({ page }) => {
  await page.route('**/api/v1/services/slug/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { title: 'X', slug: 'x', _id: 'x', basePrice: 100, priceUnit: 'flat', rating: 5, reviewCount: 0, imageUrl: '', tags: [], specifications: [], isCertified: false, estimatedDuration: '1 hour', description: 'desc' } } ) }));
  await page.goto('/dashboard/services/x');
  await expect(page.locator('text=Book This Service')).toBeVisible();
});
