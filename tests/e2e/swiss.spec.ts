import { expect, test } from '@playwright/test'

test.describe('swiss poster contract', () => {
  test('opens on paper (light default) with no stored choice', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await page.locator('html').getAttribute('data-theme')).toBeNull()
  })

  test('hero is flush-left, bottom-anchored, with tight display tracking', async ({ page }) => {
    await page.goto('/')
    const name = page.getByRole('heading', { level: 1 })
    await expect(name).toBeVisible()

    const type = await name.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { textAlign: cs.textAlign, letterSpacing: cs.letterSpacing, fontSize: cs.fontSize }
    })
    expect(type.textAlign).toBe('left')
    // letter-spacing is reported in px; compare against the font size.
    const ls = Number.parseFloat(type.letterSpacing)
    const fs = Number.parseFloat(type.fontSize)
    expect(ls / fs).toBeLessThanOrEqual(-0.03)

    // Bottom-anchored: the name sits in the lower half of the viewport.
    const box = await name.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan((viewport?.height ?? 0) * 0.5)
  })

  test('content sections render as flat grids — no radius, no panels', async ({ page }) => {
    await page.goto('/')
    for (const id of ['experience', 'education', 'publications', 'technologies']) {
      const section = page.locator(`#${id}`)
      await expect(section).toHaveCSS('display', 'grid')
      await expect(section).toHaveCSS('border-radius', '0px')
      await expect(section).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    }
    const tile = page.locator('#technologies li').first()
    await expect(tile).toHaveCSS('border-radius', '0px')
  })

  test('exactly one canvas — the flow specimen; decorative and hidden from AT', async ({
    page,
  }) => {
    await page.goto('/')
    expect(await page.locator('canvas').count()).toBe(1)
    const canvas = page.locator('[data-flow-canvas]')
    await expect(canvas).toBeAttached()
    await expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  test('nav links are keyboard-focusable', async ({ page }) => {
    await page.goto('/')
    const first = page.getByRole('navigation').getByRole('link').first()
    await first.focus()
    await expect(first).toBeFocused()
  })
})

test.describe('paper default, persisted choice', () => {
  test.use({ colorScheme: 'dark' })

  test('OS dark applies ink mode; a manual flip persists across reload', async ({ page }) => {
    await page.goto('/')

    // No stored choice — the OS dark preference owns first paint.
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 10, 10)')

    const toggle = page.getByRole('button', { name: /switch to/i })
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  })
})
