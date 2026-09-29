import { test, expect } from '@playwright/test';
test('Programmatic>DeclarativeInSequence', async ({ page }) => {
    await page.goto('./tests/Programmatic/DeclarativeInSequence.html');
    await page.waitForTimeout(2800);
    const target = page.locator('#target');
    await expect(target).toHaveAttribute('mark', 'good');
});
