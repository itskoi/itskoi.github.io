import { expect, test } from '@playwright/test'

test.describe('portfolio smoke', () => {
  test('Lenis initializes and wheel produces smooth scroll', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' })).toBeVisible()

    // Lenis adds the `lenis` class to <html> on init.
    await expect(page.locator('html')).toHaveClass(/\blenis\b/)

    // There is content below the fold; wheel input should advance scrollY
    // (Lenis raf is driven by gsap.ticker, so the change lands over a few frames).
    await page.mouse.wheel(0, 800)
    await expect
      .poll(async () => await page.evaluate(() => window.scrollY), {
        timeout: 3000,
        message: 'window.scrollY should advance after wheel',
      })
      .toBeGreaterThan(0)
  })
})
