import { test, expect } from '@playwright/test';

/**
 * Pro paywall funnel tests.
 *
 * The gate is a build-time flag (NEXT_PUBLIC_GATES_ENABLED), so one server
 * run can only exercise one mode:
 *   - default run  → asserts the free-beta state (gates invisible)
 *   - gated run    → NEXT_PUBLIC_GATES_ENABLED=true npx playwright test pro-gate
 */
const GATED = process.env.NEXT_PUBLIC_GATES_ENABLED === 'true';

test.describe('Free beta (gates off)', () => {
  test.skip(GATED, 'gates are armed in this run');

  test('no tabs are locked after loading the demo scan', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();

    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[role="tab"] svg.lucide-lock')).toHaveCount(0);
  });

  test('pricing shows the free-beta card', async ({ page }) => {
    await page.goto('/');
    const pricing = page.locator('#pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(
      pricing.getByRole('heading', { name: /Free During Beta/i }),
    ).toBeVisible();
  });
});

test.describe('Armed paywall (gates on)', () => {
  test.skip(!GATED, 'run with NEXT_PUBLIC_GATES_ENABLED=true to exercise');

  test('Pro tabs are locked and show the upgrade gate', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();

    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({
      timeout: 10000,
    });

    // Locked tab markers on the Pro tabs
    const lockCount = await page.locator('[role="tab"] svg.lucide-lock').count();
    expect(lockCount).toBeGreaterThanOrEqual(4);

    // Opening a locked tab shows the gate with checkout + restore
    await page.getByRole('tab', { name: /Game FPS/i }).click();
    await expect(page.getByText(/Upgrade to Pro/i)).toBeVisible();
    await expect(
      page.locator('a.lemonsqueezy-button[href*="lemonsqueezy.com/checkout"]').first(),
    ).toBeVisible();
    await expect(page.getByText(/Restore your purchase/i)).toBeVisible();
  });

  test('checkout success event unlocks Pro', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({
      timeout: 10000,
    });

    // Simulate the Lemon Squeezy overlay success postMessage contract
    await page.evaluate(() => {
      window.postMessage({ event: 'Checkout.Success' }, '*');
    });

    // The provider persists Pro and reloads the page
    await page.waitForFunction(
      () => {
        try {
          return JSON.parse(localStorage.getItem('pc-pro-status') ?? 'null')?.isPro === true;
        } catch {
          return false;
        }
      },
      { timeout: 5000 },
    );

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[role="tab"] svg.lucide-lock')).toHaveCount(0);
  });

  test('pricing shows Free vs Pro with a real checkout link', async ({ page }) => {
    await page.goto('/');
    const pricing = page.locator('#pricing');
    await pricing.scrollIntoViewIfNeeded();

    await expect(pricing.getByRole('heading', { name: 'Free', exact: true })).toBeVisible();
    await expect(pricing.getByRole('heading', { name: /Pro — One-Time/i })).toBeVisible();
    const buy = pricing.locator('a.lemonsqueezy-button');
    await expect(buy).toBeVisible();
    await expect(buy).toHaveAttribute('href', /lemonsqueezy\.com\/checkout\/buy/);
  });
});
