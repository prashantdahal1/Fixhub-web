import { test, expect } from '@playwright/test';

test('basic booking flow UI elements present', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    document.cookie = 'auth_token=test-token; path=/';
  });
  await page.route('**/api/v1/auth/whoami', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'user@example.com', role: 'customer', firstName: 'Test', lastName: 'User' } }) }));
  await page.route('**/api/v1/services/slug/x', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { title: 'X', slug: 'x', _id: 'x', basePrice: 100, priceUnit: 'flat', rating: 5, reviewCount: 0, imageUrl: '', tags: [], specifications: [], isCertified: false, estimatedDuration: '1 hour', description: 'desc', category: 'electrician', shortDescription: 'desc', professionalId: { profilePicture: '' } } }) }));
  await page.goto('/dashboard/services/x', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Book This Service' })).toBeVisible();
});
