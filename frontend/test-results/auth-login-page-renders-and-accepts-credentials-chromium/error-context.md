# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> login page renders and accepts credentials
- Location: playwright\auth.spec.ts:3:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Sign in"
Received string:    "Welcome back !"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    13 × locator resolved to <h1 class="text-2xl font-bold text-slate-800 mb-2">Welcome back !</h1>
       - unexpected value "Welcome back !"

```

```yaml
- heading "Welcome back !" [level=1]
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('login page renders and accepts credentials', async ({ page }) => {
  4 |   await page.goto('/login');
> 5 |   await expect(page.locator('h1')).toContainText('Sign in');
    |                                    ^ Error: expect(locator).toContainText(expected) failed
  6 |   await expect(page.locator('input[type="email"]')).toBeVisible();
  7 |   await expect(page.locator('input[type="password"]')).toBeVisible();
  8 | });
  9 | 
```