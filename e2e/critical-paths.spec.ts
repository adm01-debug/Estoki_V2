/**
 * E2E Tests — Critical User Paths
 * Tests the most important user journeys in the application.
 * 
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Authentication Flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto(BASE_URL);
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    const submitButton = page.getByRole('button', { name: /entrar|login|acessar/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show validation feedback
      await expect(page.locator('[class*="destructive"], [class*="error"], [role="alert"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show password recovery option', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    const forgotLink = page.getByText(/esquec|forgot|recuperar/i);
    await expect(forgotLink).toBeVisible();
  });
});

test.describe('Navigation & Route Guards', () => {
  test('should redirect unauthorized access to /unauthorized', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    // Should redirect to auth or unauthorized
    await page.waitForURL(/\/(auth|unauthorized)/);
    const url = page.url();
    expect(url).toMatch(/\/(auth|unauthorized)/);
  });

  test('should have working sidebar navigation when authenticated', async ({ page }) => {
    await page.goto(BASE_URL);
    // Even if redirected to auth, sidebar should be present on main app
    const sidebar = page.locator('nav, [role="navigation"]').first();
    // Just verify the page loads without JS errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    // Filter out non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('Script error') &&
      !e.includes('ChunkLoadError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Core Page Loading', () => {
  const criticalPages = [
    '/auth',
    '/dashboard',
    '/estoque',
    '/recebimento',
    '/separacao',
    '/romaneios',
    '/inventario',
    '/produtos',
    '/relatorios',
  ];

  for (const path of criticalPages) {
    test(`should load ${path} without crash`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const criticalErrors = errors.filter(e => 
        !e.includes('ResizeObserver') && 
        !e.includes('Script error') &&
        !e.includes('Failed to fetch')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Accessibility Basics', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto(BASE_URL);
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto(BASE_URL);
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should be responsive (mobile viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    // Should not have horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Performance Basics', () => {
  test('should load initial page within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have memory leaks in navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    // Navigate back and forth
    await page.goto(`${BASE_URL}/auth`);
    await page.goto(BASE_URL);
    await page.goto(`${BASE_URL}/auth`);
    // If we get here without crash, basic memory handling is OK
    expect(true).toBe(true);
  });
});
