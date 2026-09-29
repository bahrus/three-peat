import { test, expect } from '@playwright/test';

// Needs gc() exposed, which forces its own worker -- hence a separate file.
test.use({ launchOptions: { args: ['--js-flags=--expose-gc'] } });

test('Programmatic>TargetElementGC: a removed #kitchen is not kept alive', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./tests/Programmatic/TargetElementGC.html');
    await page.waitForTimeout(2000);
    // The test's own WeakRef lets it observe collection without keeping the element alive.
    await page.evaluate(() => {
        const el = document.querySelector('#kitchen');
        globalThis.__removedRef = new WeakRef(el);
        el.remove();
    });
    // WeakRef targets survive until the current job ends, so collect across several turns.
    const collected = await page.evaluate(async () => {
        const ref = globalThis.__removedRef;
        for(let i = 0; i < 20 && ref.deref() !== undefined; i++){
            await new Promise(r => setTimeout(r, 50));
            globalThis.gc();
        }
        return ref.deref() === undefined;
    });
    expect(collected, 'the removed #kitchen was garbage collected, so the enhancement held no strong reference to it').toBe(true);
    // Afterwards, the enhancement keeps working for the live target, without errors.
    await page.evaluate(async () => {
        document.querySelector('#porch').addItem({rank: 3, noc: 'Japan', total: 45});
    });
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.querySelectorAll('#destination tr:not([hidden])').length === 3), 'the other (live) target still works').toBe(true);
});
