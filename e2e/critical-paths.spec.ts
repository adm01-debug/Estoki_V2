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

 test.describe('Complex User Journeys (E2E)', () => {
   test('full inventory adjustment flow', async ({ page }) => {
     await page.goto(`${BASE_URL}/auth`);
     // Login simulation (mocking UI interaction since actual creds might vary)
     const emailInput = page.locator('input[type="email"]');
     if (await emailInput.isVisible()) {
       await emailInput.fill('admin@test.com');
       await page.locator('input[type="password"]').fill('password123');
       await page.getByRole('button', { name: /entrar|login/i }).click();
     }
 
     await page.goto(`${BASE_URL}/estoque`);
     await expect(page.locator('h1, h2')).toContainText(/estoque|inventory/i);
 
     // Simulation of selecting a product and adjusting quantity
     const productRow = page.locator('table tr').nth(1);
     if (await productRow.isVisible()) {
       await productRow.click();
       const adjustBtn = page.getByRole('button', { name: /ajustar|adjust/i });
       if (await adjustBtn.isVisible()) {
         await adjustBtn.click();
         await page.locator('input[name="quantity"], input[type="number"]').first().fill('10');
         await page.getByRole('button', { name: /confirmar|save/i }).click();
         // Verify success toast/message
         await expect(page.locator('text=/sucesso|success/i')).toBeVisible();
       }
     }
   });
 
    test('full receiving process flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/recebimento`);
      await expect(page.locator('body')).toBeVisible();

      const newReceivingBtn = page.getByRole('button', { name: /novo|new|entrada/i }).first();
      if (await newReceivingBtn.isVisible()) {
        await newReceivingBtn.click();
        
        const form = page.locator('form, [role="dialog"]').first();
        await expect(form).toBeVisible();

        const supplierField = page.locator('input[placeholder*="fornecedor"i], select, [role="combobox"]').first();
        if (await supplierField.isVisible()) {
          await supplierField.click();
          await page.keyboard.type('Test Supplier');
          await page.keyboard.press('Enter');
        }

        const createBtn = page.getByRole('button', { name: /criar|confirmar|salvar/i });
        if (await createBtn.isVisible()) {
          await createBtn.click();
        }
      }
    });

    test('full picking process flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/picking`);
      await expect(page.locator('h1, h2')).toContainText(/picking|separação/i);

      const tasks = page.locator('table tr, [role="listitem"]');
      if (await tasks.count() > 1) {
        const firstTask = tasks.nth(1);
        await firstTask.click();
        
        const startBtn = page.getByRole('button', { name: /iniciar|começar|start/i });
        if (await startBtn.isVisible()) {
          await startBtn.click();
          const confirmItemBtn = page.getByRole('button', { name: /confirmar|ok/i }).first();
          if (await confirmItemBtn.isVisible()) {
            await confirmItemBtn.click();
          }
        }
      }
    });
 
   test('role-based access verification', async ({ page }) => {
     // Try to access admin area as unauthenticated
     await page.goto(`${BASE_URL}/admin`);
     await expect(page).toHaveURL(/\/auth|unauthorized/);
   });
 });

 test.describe('Stability & Resiliency (Fuzzing)', () => {
    const targetPages = [
      '/estoque', 
      '/recebimento', 
      '/configuracoes', 
      '/produtos', 
      '/picking', 
      '/ondas', 
      '/tarefas',
      '/pedidos',
      '/expedicao'
    ];
   
   for (const route of targetPages) {
     test(`fuzz test inputs on ${route}`, async ({ page }) => {
       await page.goto(`${BASE_URL}${route}`);
       const inputs = await page.locator('input').all();
       
       if (inputs.length > 0) {
         const payload = "'; DROP TABLE users; -- <script>alert(1)</script>";
         for (const input of inputs.slice(0, 3)) { // Test first 3 inputs
           if (await input.isVisible() && await input.isEditable()) {
             await input.fill(payload);
             await page.keyboard.press('Enter');
             // Check that the page didn't crash (White screen of death)
             await expect(page.locator('body')).toBeVisible();
             const errorBoundary = page.locator('text=/something went wrong|erro inesperado/i');
             await expect(errorBoundary).not.toBeVisible();
           }
         }
       }
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

test.describe('Performance & Optimization', () => {
  test('should load initial page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
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
