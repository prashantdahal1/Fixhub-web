# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-notifications.spec.ts >> Admin notification workflow >> admin login and ticket page should render
- Location: playwright\admin-notifications.spec.ts:7:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/admin" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]: FixHub
    - generic [ref=e9]:
      - generic [ref=e10]:
        - heading "Admin sign in" [level=1] [ref=e11]
        - paragraph [ref=e12]: Enter your credentials to access the admin panel.
      - generic [ref=e13]:
        - generic [ref=e14]: Backend unreachable. Check that the Express server is running and BACKEND_URL is correct.
        - generic [ref=e15]:
          - generic [ref=e16]: Email
          - textbox "Email" [ref=e21]:
            - /placeholder: you@fixhub.com
            - text: admin@fixhub.com
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Password
            - link "Forgot password?" [ref=e25] [cursor=pointer]:
              - /url: "#"
          - generic [ref=e26]:
            - textbox "Password" [ref=e30]:
              - /placeholder: ••••••••
              - text: admin123
            - button [ref=e31]
        - generic [ref=e35] [cursor=pointer]:
          - checkbox "Keep me signed in" [ref=e36]
          - generic [ref=e37]: Keep me signed in
        - button "Sign in" [ref=e38]
    - paragraph [ref=e39]: FixHub Admin Panel — restricted access only.
  - region "Notifications Alt+T"
  - button "Chat with Fixie" [ref=e41] [cursor=pointer]:
    - generic [ref=e47]: Ask Fixie
  - generic [ref=e52] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e53]
    - generic [ref=e57]:
      - button "Open issues overlay" [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]: "0"
          - generic [ref=e61]: "1"
        - generic [ref=e62]: Issue
      - button "Collapse issues badge" [ref=e63]
  - alert [ref=e66]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ADMIN_EMAIL = 'admin@fixhub.com';
  4  | const ADMIN_PASSWORD = 'admin123';
  5  | 
  6  | test.describe('Admin notification workflow', () => {
  7  |   test('admin login and ticket page should render', async ({ page }) => {
  8  |     await page.goto('/admin/login');
  9  |     await expect(page).toHaveURL(/\/admin\/login$/);
  10 | 
  11 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  12 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  13 |     await page.click('button:has-text("Sign in")');
  14 | 
> 15 |     await page.waitForURL('/admin');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  16 |     await expect(page.locator('h1')).toContainText('Admin Workspace');
  17 |   });
  18 | });
  19 | 
```