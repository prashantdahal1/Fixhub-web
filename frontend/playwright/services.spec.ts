import { test, expect } from '@playwright/test';

const servicesFixture = {
  success: true,
  data: [
    {
      _id: 'svc1',
      title: 'Test Electrician Service',
      slug: 'test-electrician-service',
      category: 'electrician',
      shortDescription: 'Quick wiring fixes',
      basePrice: 499,
      priceUnit: 'flat',
      rating: 4.8,
      reviewCount: 12,
      imageUrl: '',
      isCertified: true,
      estimatedDuration: '1-2 hours'
    },
    {
      _id: 'svc2',
      title: 'Test Plumber Service',
      slug: 'test-plumber-service',
      category: 'plumber',
      shortDescription: 'Faucet & pipe repairs',
      basePrice: 699,
      priceUnit: 'flat',
      rating: 4.6,
      reviewCount: 5,
      imageUrl: '',
      isCertified: false,
      estimatedDuration: '1-3 hours'
    }
  ],
  meta: { total: 2 }
};

test('services list shows cards and search input', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    document.cookie = 'auth_token=test-token; path=/';
  });

  await page.route('**/api/v1/auth/whoami', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'test@fixhub', firstName: 'Test', lastName: 'User', role: 'customer' } }) });
  });

  await page.route('**/api/v1/services?*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(servicesFixture),
    });
  });

  await page.goto('/dashboard/services', { waitUntil: 'networkidle' });

  await expect(page.locator('h1')).toContainText('Browse Services', { timeout: 10000 });
  await expect(page.locator('input[placeholder="Search services..."]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Test Electrician Service')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Test Plumber Service')).toBeVisible({ timeout: 10000 });
});
