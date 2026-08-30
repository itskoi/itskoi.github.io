import { expect, test } from '@playwright/test'

test.describe('portfolio page', () => {
  test('nav lists every section and smooth-scrolls while staying sticky', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link')).toHaveText([
      'Experience',
      'Education',
      'Publications',
      'Technologies',
    ])

    await nav.getByRole('link', { name: 'Education' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Education' })).toBeInViewport()
    await expect(nav).toBeInViewport()

    // The section that's scrolled into view becomes the active ToC entry.
    await expect(nav.getByRole('link', { name: 'Education' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  test('renders key content across the page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Wao' })).toBeVisible()
    await expect(page.getByText('University of Science')).toBeVisible()
    await expect(page.getByText(/IEEE-RIVF/)).toBeVisible()
  })

  test('renders the flow canvas behind the content', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-flow-canvas]')).toBeAttached()
    // Content stays visible on top of the canvas.
    await expect(page.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' })).toBeVisible()
  })

  test('Education content stays readable above the canvas through the vortex street', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' }).waitFor()
    const canvas = page.locator('[data-flow-canvas]')
    await expect(canvas).toBeAttached()

    // Enter Education — the band where the vortex street is fully developed.
    await page.getByRole('navigation').getByRole('link', { name: 'Education' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Education' })).toBeInViewport()

    // The card text and a certification link stay visible above the canvas.
    await expect(page.getByText('University of Science')).toBeVisible()
    await expect(page.getByRole('link', { name: /Google Cloud Skills Boost/ })).toBeVisible()
    await expect(canvas).toBeAttached()

    // Nudge further so the street decays, then scroll back up — canvas survives the reverse.
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 600)
      await page.waitForTimeout(80)
    }
    await expect(canvas).toBeAttached()
    await page.getByRole('navigation').getByRole('link', { name: 'Experience' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeInViewport()
    await expect(canvas).toBeAttached()
  })

  test('wheel-scroll can reach the very bottom of the page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' }).waitFor()

    const maxScroll = () =>
      page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)

    // Page must be tall (hero + four content sections).
    expect(await maxScroll()).toBeGreaterThan(2000)

    // Wheel down repeatedly until scrollY stops advancing.
    let prev = -1
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 2000)
      await page.waitForTimeout(120)
      const y = await page.evaluate(() => window.scrollY)
      if (y === prev) break
      prev = y
    }

    const y = await page.evaluate(() => window.scrollY)
    expect(y).toBeGreaterThan((await maxScroll()) - 50)
  })
})
