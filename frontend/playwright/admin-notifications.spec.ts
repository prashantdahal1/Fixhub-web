import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@fixhub.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Admin notification workflow', () => {
  test('admin login and ticket page should render', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Sign in")');

    await page.waitForURL('/admin');
    await expect(page.locator('h1')).toContainText('Admin Workspace');
  });
});
