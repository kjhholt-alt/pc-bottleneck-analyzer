import { test, expect } from '@playwright/test';

test.describe('Analyzer Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should show upload section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for upload button or file input
    const uploadSection = page.locator('text=/Upload.*Scan/i');
    await expect(uploadSection.or(page.locator('input[type="file"]'))).toBeVisible();
  });

  test('should display demo mode option', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for demo/sample data button
    const demoButton = page.getByRole('button', { name: /demo|sample|example/i });
    await expect(demoButton).toBeVisible();
  });

  test('should load demo data when clicking demo button', async ({ page }) => {
    await page.goto('/dashboard');

    // Click demo button
    await page.getByRole('button', { name: /demo|sample|example/i }).click();

    // Wait for analysis results to appear
    await expect(page.getByText(/Performance Score/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/CPU|Processor/i)).toBeVisible();
    await expect(page.getByText(/GPU|Graphics/i)).toBeVisible();
  });

  test('should display analysis results with charts', async ({ page }) => {
    await page.goto('/dashboard');

    // Load demo data
    await page.getByRole('button', { name: /demo|sample|example/i }).click();

    // Wait for results
    await page.waitForTimeout(2000);

    // Check for performance metrics
    await expect(page.locator('text=/Performance Score/i')).toBeVisible();

    // Check for bottleneck warnings
    const warningText = page.locator('text=/bottleneck|warning|critical/i');
    await expect(warningText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show upgrade recommendations', async ({ page }) => {
    await page.goto('/dashboard');

    // Load demo data
    await page.getByRole('button', { name: /demo|sample|example/i }).click();

    // Wait for analysis
    await page.waitForTimeout(2000);

    // Check for recommendations section
    const recommendations = page.locator('text=/Recommendation|Upgrade|Improve/i');
    await expect(recommendations.first()).toBeVisible({ timeout: 5000 });
  });
});
