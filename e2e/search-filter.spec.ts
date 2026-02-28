import { expect, test } from "@playwright/test";

test("search and filter works", async ({ page }) => {
  await page.goto("/catalog");

  await page.getByLabel("Search products").fill("Logitech");
  await page.getByLabel("Search products").press("Enter");

  await expect(page).toHaveURL(/q=Logitech/);
  await expect(page.getByTestId("product-card").first()).toBeVisible();

  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "Apply" }).first().click();

  await expect(page).toHaveURL(/category=/);
});
