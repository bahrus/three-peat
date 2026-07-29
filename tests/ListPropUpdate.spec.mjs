import { test, expect } from '@playwright/test';
test('ListPropUpdate', async ({ page }) => {
    await page.goto('./tests/ListPropUpdate.html');
    // wait for 4 seconds
    await page.waitForTimeout(4000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
