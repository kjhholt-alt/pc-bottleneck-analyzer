import { test, expect } from '@playwright/test';

/**
 * PC Upgrade Blueprint funnel tests.
 *
 * The gate is a build-time flag (NEXT_PUBLIC_BLUEPRINT_ENABLED), so one server
 * run can only exercise one mode:
 *   - default run  → asserts the dormant state (route + CTAs hidden)
 *   - armed run    → NEXT_PUBLIC_BLUEPRINT_ENABLED=true npx playwright test blueprint
 */
const ARMED = process.env.NEXT_PUBLIC_BLUEPRINT_ENABLED === 'true';

test.describe('Blueprint dormant (flag off)', () => {
  test.skip(ARMED, 'Blueprint is armed in this run');

  test('/blueprint shows a coming-soon page, not the picker', async ({ page }) => {
    await page.goto('/blueprint');
    await expect(page.getByText(/Coming Soon/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Build My Blueprint/i })).toHaveCount(0);
  });

  test('no Blueprint CTA on the best-gpu-for game pages', async ({ page }) => {
    await page.goto('/best-gpu-for/cyberpunk-2077');
    await expect(page.getByText(/Get Your Upgrade Blueprint/i)).toHaveCount(0);
  });

  test('no Blueprint CTA on the tier-lists hub', async ({ page }) => {
    await page.goto('/tier-lists');
    await expect(page.getByText(/Get Your Upgrade Blueprint/i)).toHaveCount(0);
  });

  test('no Blueprint CTA in the analyzer Recommendations tab', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('tab', { name: /Recommendations/i }).click();
    await expect(page.getByText(/Get Your Upgrade Blueprint/i)).toHaveCount(0);
  });
});

test.describe('Blueprint armed (flag on)', () => {
  test.skip(!ARMED, 'run with NEXT_PUBLIC_BLUEPRINT_ENABLED=true to exercise');

  test('CTA appears on the best-gpu-for pages and links to /blueprint', async ({ page }) => {
    await page.goto('/best-gpu-for/cyberpunk-2077');
    const cta = page.getByRole('link', { name: /Build My Blueprint/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/blueprint');
  });

  test('CTA appears on the tier-lists hub', async ({ page }) => {
    await page.goto('/tier-lists');
    await expect(page.getByRole('link', { name: /Build My Blueprint/i })).toBeVisible();
  });

  test('CTA appears in the analyzer Recommendations tab', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('tab', { name: /Recommendations/i }).click();
    await expect(page.getByRole('link', { name: /Build My Blueprint/i })).toBeVisible();
  });

  test('picker -> paywall -> license unlock -> full report renders', async ({ page }) => {
    await page.goto('/blueprint');

    // Picker is shown with sensible defaults already selected.
    const submit = page.getByRole('button', { name: /Build My Blueprint/i });
    await expect(submit).toBeVisible();
    await submit.click();

    // Paywall: verdict is visible for free, ladder is blurred behind a lock.
    await expect(page.getByText(/Performance score:/i)).toBeVisible();
    await expect(page.getByText(/Unlock Your Full Blueprint/i)).toBeVisible();

    // Simulate a valid license activation without hitting Lemon Squeezy.
    await page.route('**/api/license/activate', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, instanceId: 'test-instance' }),
      }),
    );

    await page.getByPlaceholder(/XXXXXXXX-XXXX/i).fill('TEST-BLUEPRINT-KEY');
    await page.getByRole('button', { name: /^Activate$/i }).click();

    await expect(page.getByRole('heading', { name: /Your PC Upgrade Blueprint/i, level: 2 })).toBeVisible();
    await expect(page.getByText(/Upgrade ladder/i)).toBeVisible();
    await expect(page.getByText(/Order of operations/i)).toBeVisible();
  });

  test('unlocked report persists across reload via stored license + picks', async ({ page }) => {
    await page.goto('/blueprint');
    await page.getByRole('button', { name: /Build My Blueprint/i }).click();

    await page.route('**/api/license/activate', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, instanceId: 'test-instance' }),
      }),
    );
    await page.getByPlaceholder(/XXXXXXXX-XXXX/i).fill('TEST-BLUEPRINT-KEY');
    await page.getByRole('button', { name: /^Activate$/i }).click();
    await expect(page.getByRole('heading', { name: /Your PC Upgrade Blueprint/i, level: 2 })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: /Your PC Upgrade Blueprint/i, level: 2 })).toBeVisible();
  });
});
