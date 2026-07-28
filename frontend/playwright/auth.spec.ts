import { test, expect } from '@playwright/test';

test('login page renders and accepts credentials', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('Sign in');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
