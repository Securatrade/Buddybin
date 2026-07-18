import { expect, test } from "@playwright/test";

test("customer starts signup, adds a bin, sees price and reaches mocked checkout", async ({ page }) => {
  await page.route("**/api/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        url: "http://localhost:3000/checkout/success?session_id=cs_test_mock",
      }),
    });
  });

  await page.goto("/#signup");

  await page.getByLabel("Postcode").fill("SW1A 1AA");
  await page.getByLabel("Address line 1").fill("10 Downing Street");
  await page.getByLabel("Town or city").fill("London");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Add bin" }).click();
  await expect(page.locator("aside").getByText("£6.99").first()).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Full name").fill("Test Customer");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel("Mobile number").fill("07123 456 789");
  await page.getByLabel("I agree to the Terms and Conditions.").check();
  await page
    .getByLabel(
      "I understand that BuddyBin arranges the service through an independent local cleaning partner.",
    )
    .check();
  await page.getByRole("button", { name: "Review plan" }).click();

  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page).toHaveURL(/checkout\/success\?session_id=cs_test_mock/);
});
