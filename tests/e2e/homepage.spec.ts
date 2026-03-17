import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/PC Bottleneck Analyzer/i);

    // Check main heading
    await expect(page.getByRole('heading', { name: /PC Bottleneck Analyzer/i })).toBeVisible();

    // Check CTA buttons exist
    await expect(page.getByRole('link', { name: /Analyze Now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download Scanner/i })).toBeVisible();
  });

  test('should navigate to dashboard when clicking Analyze Now', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Analyze Now/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Check for key features section
    await expect(page.getByText(/Hardware Detection/i)).toBeVisible();
    await expect(page.getByText(/AI-Powered Analysis/i)).toBeVisible();
    await expect(page.getByText(/Optimization Guide/i)).toBeVisible();
  });

  test('should have email capture form', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
  });
});
