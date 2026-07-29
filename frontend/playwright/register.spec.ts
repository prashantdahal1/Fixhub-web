import { test, expect } from '@playwright/test';

test('register page should render form fields', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  await expect(page.locator('input[name="fullName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
});
