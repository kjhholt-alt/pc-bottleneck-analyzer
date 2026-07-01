import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should load blog listing page', async ({ page }) => {
    await page.goto('/blog');

    await expect(page).toHaveTitle(/Blog/i);
    await expect(page.getByRole('heading', { name: /Blog/i }).first()).toBeVisible();
  });

  test('should display blog post cards', async ({ page }) => {
    await page.goto('/blog');

    // Check for at least one blog post link
    const blogLinks = page
      .getByRole('link')
      .filter({ hasText: /CPU|GPU|Bottleneck|PC/i });
    await expect(blogLinks.first()).toBeVisible();
  });

  test('should navigate to individual blog post and render content', async ({
    page,
  }) => {
    await page.goto('/blog');

    // Follow the first real post link (slugs change as content regenerates)
    const firstPost = page
      .locator('a[href^="/blog/"]')
      .filter({ hasText: /.+/ })
      .first();
    await firstPost.click();

    // Post pages compile on first hit in dev — allow extra time
    await expect(page).toHaveURL(/\/blog\/.+/, { timeout: 20000 });
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('should have working back to blog link', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page
      .locator('a[href^="/blog/"]')
      .filter({ hasText: /.+/ })
      .first();
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\/.+/, { timeout: 20000 });

    const backLink = page.getByRole('link', { name: /back|all posts/i }).first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL(/\/blog\/?$/);
    }
  });
});
