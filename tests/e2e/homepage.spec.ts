import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/PC Bottleneck Analyzer/i);

    // Check main heading
    await expect(
      page.getByRole('heading', { name: /Bottlenecking.*Your PC/i }),
    ).toBeVisible();

    // Check CTA buttons exist
    await expect(
      page.getByRole('link', { name: /Analyze My PC/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Download Scanner/i }).first(),
    ).toBeVisible();
  });

  test('should navigate to dashboard when clicking Analyze My PC', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Analyze My PC/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Feature cards fade in on scroll (whileInView) — scroll to them first
    const features = page.getByRole('heading', { name: 'More Than Just a Score' });
    await features.scrollIntoViewIfNeeded();

    await expect(page.getByRole('heading', { name: 'Performance Score' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bottleneck Detection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upgrade Simulator' })).toBeVisible();
  });

  test('should show the pricing section', async ({ page }) => {
    await page.goto('/');

    const pricing = page.locator('#pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing.getByRole('heading').first()).toBeVisible();
  });

  test('should have email capture form', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.scrollIntoViewIfNeeded();
    await expect(emailInput).toBeVisible();
  });
});
