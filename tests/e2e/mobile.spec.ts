import { test, expect } from '@playwright/test';

// Mobile tests will run on Mobile Chrome and Mobile Safari projects defined in playwright.config.ts
// This file contains tests that verify mobile-specific functionality

test.describe('Mobile Responsive Design', () => {
  test('should load homepage on mobile', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /PC Bottleneck Analyzer/i })).toBeVisible();
  });

  test('should have responsive navigation on mobile', async ({ page }) => {
    await page.goto('/');

    // Check for navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display dashboard on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

    // Load demo data
    const demoButton = page.getByRole('button', { name: /demo|sample|example/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(2000);

      // Results should be visible
      await expect(page.getByText(/Performance Score/i)).toBeVisible();
    }
  });

  test('should render blog posts on mobile', async ({ page }) => {
    await page.goto('/blog');

    // Blog posts should be visible
    const blogLinks = page.getByRole('link').filter({ hasText: /CPU|GPU|Bottleneck/i });
    await expect(blogLinks.first()).toBeVisible();
  });

  test('should have readable text on mobile', async ({ page, viewport }) => {
    // Only run on actual mobile viewports
    if (!viewport || viewport.width > 768) {
      test.skip();
    }

    await page.goto('/');

    // Check that main heading has reasonable font size
    const heading = page.getByRole('heading', { name: /PC Bottleneck Analyzer/i });
    const fontSize = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font size should be at least 20px on mobile
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(20);
  });

  test('should have touch-friendly buttons on mobile', async ({ page, viewport }) => {
    // Only run on actual mobile viewports
    if (!viewport || viewport.width > 768) {
      test.skip();
    }

    await page.goto('/');

    // Check CTA button size
    const ctaButton = page.getByRole('link', { name: /Analyze Now/i }).first();
    const box = await ctaButton.boundingBox();

    // Button should be at least 44x44 (iOS touch target minimum)
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
