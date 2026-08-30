import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('accessibility smoke checks', () => {
  test('sign-in page has no critical or serious violations', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('form').first()).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter((violation) =>
      violation.impact === 'critical' || violation.impact === 'serious'
    );

    expect(blockingViolations).toEqual([]);
  });
});
