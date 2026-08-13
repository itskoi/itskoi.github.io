import { expect, test } from '@playwright/test'

test.describe('typography & theme', () => {
  test.describe('manual toggle (dark default)', () => {
    test.use({ colorScheme: 'dark' })

    test('flips the theme and the choice persists across reload', async ({ page }) => {
      await page.goto('/')
      const html = page.locator('html')
      const body = page.locator('body')
      const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i })

      await expect(toggle).toBeVisible()
      await expect(body).toHaveCSS('background-color', 'rgb(8, 9, 12)') // dark bg

      await toggle.click()
      await expect(html).toHaveAttribute('data-theme', 'light')
      await expect(body).toHaveCSS('background-color', 'rgb(247, 248, 250)') // light bg

      await page.reload()
      await expect(html).toHaveAttribute('data-theme', 'light')
      await expect(body).toHaveCSS('background-color', 'rgb(247, 248, 250)')
    })

    test('loads fonts with no third-party request', async ({ page }) => {
      const thirdParty: string[] = []
      page.on('response', (res) => {
        const host = new URL(res.url()).hostname
        if (/(^|\.)(googleapis\.com|gstatic\.com)$/.test(host)) thirdParty.push(res.url())
      })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      expect(thirdParty).toEqual([])
    })
  })

  test.describe('OS preference', () => {
    test.use({ colorScheme: 'light' })

    test('follows the OS light preference on first visit (no explicit choice)', async ({
      page,
    }) => {
      await page.goto('/')
      expect(await page.locator('html').getAttribute('data-theme')).toBeNull()
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 250)')
    })
  })
})
