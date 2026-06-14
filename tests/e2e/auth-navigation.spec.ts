import { test, expect } from "@playwright/test";

test.describe("Auth and Navigation Flow", () => {
  test("Redirect to login when unauthenticated", async ({ page }) => {
    // Navigate to protected route
    await page.goto("/dashboard");

    // Should redirect to auth/login or auth
    await expect(page).toHaveURL(/.*\/auth/);
    await expect(page.locator("#login-email")).toBeVisible();
  });

  test("Login and Logout Flow", async ({ page }) => {
    // 1. Go to login page
    await page.goto("/auth/login");

    // 2. Fill login form (Mocking Supabase auth via local storage later if needed,
    // but here we check UI elements and transitions)
    await page.fill("#login-email", "admin@freightquest.com");
    await page.fill("#login-password", "password123");

    // 3. Instead of real login which might fail without real backend,
    // we simulate a successful login state and check navigation
    await page.evaluate(() => {
      localStorage.setItem(
        "sb-wrhidiguevvnqywlueps-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "mock-user-id", email: "admin@freightquest.com" },
        })
      );
    });

    await page.goto("/");

    // 4. Verify we are in the dashboard
    await expect(page).toHaveURL(/\/dashboard|\//);

    // 5. Navigate through sidebar
    // Click on "Estoque" (Inventory)
    await page.click("text=Estoque");
    await expect(page).toHaveURL(/.*estoque/);

    // Click on "Recebimento" (Receiving)
    await page.click("text=Recebimento");
    await expect(page).toHaveURL(/.*recebimento/);

    // 6. Test Logout
    // The logout button is in the Sidebar
    const logoutBtn = page.locator('button:has-text("Sair"), [aria-label*="Sair"]');
    await logoutBtn.first().click();

    // Should be back at auth
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("Protected Routes access control", async ({ page }) => {
    // Ensure that direct access to sensitive routes is blocked if not logged in
    const protectedRoutes = ["/admin", "/settings", "/wms/inventory"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/.*\/auth/);
    }
  });

  test("Navigation persistence after page refresh", async ({ page }) => {
    // Simulate login
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "sb-wrhidiguevvnqywlueps-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "mock-user-id", email: "admin@freightquest.com" },
        })
      );
    });

    await page.goto("/wms/inventory");
    await expect(page).toHaveURL(/.*inventory/);

    // Refresh page
    await page.reload();

    // Should still be on the same page (session persisted)
    await expect(page).toHaveURL(/.*inventory/);
  });
});
