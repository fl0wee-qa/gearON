import { expect, test } from "@playwright/test";

test("add to cart works", async ({ page }) => {
  await page.goto("/catalog");

  await page.getByTestId("add-to-cart-button").first().click();

  await expect(page.getByText("Your Cart")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Proceed to Checkout" }),
  ).toBeVisible();
});
