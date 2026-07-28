import { test, expect } from '@playwright/test';

const serviceDetail = {
  success: true,
  data: {
    _id: 'svc1',
    title: 'Test Electrician Service',
    slug: 'test-electrician-service',
    category: 'electrician',
    description: 'Full description of electrician service',
    shortDescription: 'Quick wiring fixes',
    basePrice: 499,
    priceUnit: 'flat',
    rating: 4.8,
    reviewCount: 12,
    imageUrl: '',
    tags: ['electrical', 'safety'],
    specifications: [{ label: 'Coverage', value: 'Home' }],
    isCertified: true,
    estimatedDuration: '1-2 hours'
  }
};

const reviewsFixture = { success: true, data: [] };

test('service detail renders title and booking card', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    document.cookie = 'auth_token=test-token; path=/';
  });

  await page.route('**/api/v1/auth/whoami', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { email: 'test@fixhub', firstName: 'Test', lastName: 'User', role: 'customer' } }) });
  });

  await page.route('**/api/v1/services?*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [serviceDetail.data], meta: { total: 1 } }) })
  );
  await page.route('**/api/v1/services/slug/test-electrician-service', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(serviceDetail) })
  );
  await page.route('**/api/v1/reviews/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reviewsFixture) }));

  await page.goto('/dashboard/services', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('Browse Services', { timeout: 10000 });
  await page.getByText('Test Electrician Service').click();

  await expect(page.locator('h1')).toContainText('Test Electrician Service', { timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Book This Service' })).toBeVisible();
  await expect(page.locator('text=Starting from')).toBeVisible();
});
