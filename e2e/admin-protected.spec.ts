import { expect, test } from "@playwright/test";

test("admin route is protected", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
