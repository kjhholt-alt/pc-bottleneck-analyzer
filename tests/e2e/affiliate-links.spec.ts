import { test, expect } from '@playwright/test';

test.describe('Affiliate Links', () => {
  const AFFILIATE_TAG = 'bottleneck20-20';

  test('should have Amazon affiliate tag in product links', async ({ page }) => {
    await page.goto('/dashboard');

    // Load demo data to get recommendations
    await page.getByRole('button', { name: /demo|sample|example/i }).click();
    await page.waitForTimeout(2000);

    // Find Amazon links
    const amazonLinks = page.locator(`a[href*="amazon.com"]`);

    if (await amazonLinks.count() > 0) {
      // Check first Amazon link
      const firstLink = amazonLinks.first();
      const href = await firstLink.getAttribute('href');

      // Should contain affiliate tag
      expect(href).toContain(AFFILIATE_TAG);
    }
  });

  test('should have affiliate links in blog posts', async ({ page }) => {
    await page.goto('/blog/best-upgrades-pc-bottlenecks-2026');

    // Find Amazon links
    const amazonLinks = page.locator(`a[href*="amazon.com"]`);

    if (await amazonLinks.count() > 0) {
      const firstLink = amazonLinks.first();
      const href = await firstLink.getAttribute('href');

      // Should contain affiliate tag
      expect(href).toContain(AFFILIATE_TAG);
    }
  });

  test('should open affiliate links in new tab', async ({ page }) => {
    await page.goto('/blog/best-upgrades-pc-bottlenecks-2026');

    const amazonLinks = page.locator(`a[href*="amazon.com"]`);

    if (await amazonLinks.count() > 0) {
      const firstLink = amazonLinks.first();

      // Should have target="_blank"
      const target = await firstLink.getAttribute('target');
      expect(target).toBe('_blank');

      // Should have rel="noopener noreferrer"
      const rel = await firstLink.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('should track affiliate link clicks', async ({ page }) => {
    await page.goto('/dashboard');

    // Load demo data
    await page.getByRole('button', { name: /demo|sample|example/i }).click();
    await page.waitForTimeout(2000);

    // Set up request listener for tracking
    let trackingCalled = false;
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/t') || url.includes('analytics')) {
        trackingCalled = true;
      }
    });

    // Click Amazon link if exists
    const amazonLinks = page.locator(`a[href*="amazon.com"]`);
    if (await amazonLinks.count() > 0) {
      await amazonLinks.first().click({ noWaitAfter: true });

      // Give tracking a moment to fire
      await page.waitForTimeout(500);

      // Tracking should have been called
      expect(trackingCalled).toBeTruthy();
    }
  });
});
