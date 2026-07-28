import { test, expect } from '@playwright/test';

test('admin login page should render correctly', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.locator('text=Admin sign in')).toBeVisible();
  await expect(page.locator('input#email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
  await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
});
