import { test, expect } from '@playwright/test';

test.describe('Analyzer Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /Running at.*Full Speed/i }),
    ).toBeVisible();
  });

  test('should show upload section', async ({ page }) => {
    await page.goto('/dashboard');

    // Drag-and-drop uploader with a hidden file input behind it
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.getByRole('button', { name: /Try Demo/i })).toBeVisible();
  });

  test('should display demo mode option', async ({ page }) => {
    await page.goto('/dashboard');

    const demoButton = page.getByRole('button', { name: /demo|sample|example/i });
    await expect(demoButton).toBeVisible();
  });

  test('should load demo data when clicking demo button', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Try Demo/i }).click();

    // The tabbed dashboard appears once a scan is loaded
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('tab', { name: /Bottleneck Analysis/i }),
    ).toBeVisible();
  });

  test('should display bottleneck analysis results', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Try Demo/i }).click();
    await page.getByRole('tab', { name: /Bottleneck Analysis/i }).click();

    await expect(page.getByText(/Detected Bottlenecks/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show upgrade recommendations', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Try Demo/i }).click();
    await page.getByRole('tab', { name: /Recommendations/i }).click();

    const recommendations = page.locator('text=/Recommendation|Upgrade|Improve/i');
    await expect(recommendations.first()).toBeVisible({ timeout: 10000 });
  });
});
