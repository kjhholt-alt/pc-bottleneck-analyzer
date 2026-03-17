import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should load blog listing page', async ({ page }) => {
    await page.goto('/blog');

    await expect(page).toHaveTitle(/Blog/i);
    await expect(page.getByRole('heading', { name: /Blog/i })).toBeVisible();
  });

  test('should display blog post cards', async ({ page }) => {
    await page.goto('/blog');

    // Check for at least one blog post link
    const blogLinks = page.getByRole('link').filter({ hasText: /CPU|GPU|Bottleneck|PC/i });
    await expect(blogLinks.first()).toBeVisible();
  });

  test('should navigate to individual blog post', async ({ page }) => {
    await page.goto('/blog');

    // Click on first blog post
    const firstPost = page.getByRole('link').filter({ hasText: /CPU|GPU|Bottleneck|PC/i }).first();
    await firstPost.click();

    // Should be on a blog post page
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Should have article content
    await expect(page.locator('article, [role="article"], main')).toBeVisible();
  });

  test('should render blog post content', async ({ page }) => {
    // Navigate to a specific known blog post
    await page.goto('/blog/cpu-vs-gpu-bottleneck');

    // Check for heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check for content paragraphs
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('should have working back to blog link', async ({ page }) => {
    await page.goto('/blog/cpu-vs-gpu-bottleneck');

    // Look for back/return link
    const backLink = page.getByRole('link', { name: /back|blog|all posts/i });
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL(/\/blog$/);
    }
  });
});
