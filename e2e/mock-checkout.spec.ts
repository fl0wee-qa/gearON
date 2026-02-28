import { expect, test } from "@playwright/test";

test("mock checkout works", async ({ page }) => {
  await page.goto("/catalog");

  await page.getByTestId("add-to-cart-button").first().click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();

  await page.getByLabel("Full name").fill("Test Shopper");
  await page.getByLabel("Email").fill("shopper@example.com");
  await page.getByLabel("Address").fill("123 Main St");
  await page.getByLabel("City").fill("Austin");
  await page.getByLabel("Country").fill("United States");

  await page.getByRole("button", { name: "Place Order" }).click();
  await expect(page.getByText("Mock Checkout")).toBeVisible();

  await page.getByRole("button", { name: "Confirm Mock Payment" }).click();

  await expect(page).toHaveURL(/checkout\/success/);
  await expect(page.getByText("Payment received")).toBeVisible();
});
