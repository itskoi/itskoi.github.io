import { expect, test } from '@playwright/test'

const MEASURE = 1280 // --grid-max-width: 80rem

test.describe('content measure on a wide display (1920×1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('section boxes stay full-bleed while their content caps at the measure', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const geom = await page.locator('#experience').evaluate((el) => {
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const padLeft = parseFloat(cs.paddingLeft)
      return {
        vw: document.documentElement.clientWidth,
        boxWidth: rect.width,
        contentWidth: rect.width - padLeft - parseFloat(cs.paddingRight),
        contentLeft: rect.left + padLeft,
      }
    })
    // The hairline rule spans the viewport — the grammar is unchanged.
    expect(geom.boxWidth).toBeCloseTo(geom.vw, 0)
    // The grid content is exactly the measure, centered.
    expect(geom.contentWidth).toBe(MEASURE)
    expect(geom.contentLeft).toBeCloseTo((geom.vw - MEASURE) / 2, 0)
  })

  test('the hero poster caps at the same measure', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const geom = await page.locator('section[aria-label="Introduction"]').evaluate((el) => {
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const padLeft = parseFloat(cs.paddingLeft)
      return {
        vw: document.documentElement.clientWidth,
        contentWidth: rect.width - padLeft - parseFloat(cs.paddingRight),
        contentLeft: rect.left + padLeft,
      }
    })
    expect(geom.contentWidth).toBe(MEASURE)
    expect(geom.contentLeft).toBeCloseTo((geom.vw - MEASURE) / 2, 0)
  })

  test('nav links align to the measure’s left edge', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const navLeft = await page
      .getByRole('navigation')
      .locator('ul')
      .evaluate((el) => el.getBoundingClientRect().left)
    const vw = await page.evaluate(() => document.documentElement.clientWidth)
    expect(navLeft).toBeCloseTo((vw - MEASURE) / 2, 0)
  })
})

test.describe('content measure below the threshold (1280×720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('the layout is unchanged — margin inset, no capping', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const geom = await page.locator('#experience').evaluate((el) => {
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const padLeft = parseFloat(cs.paddingLeft)
      return {
        vw: document.documentElement.clientWidth,
        boxWidth: rect.width,
        padLeft,
        contentWidth: rect.width - padLeft - parseFloat(cs.paddingRight),
      }
    })
    // clamp(1.25rem, 5vw, 4rem) lands exactly on its 4rem cap at 1280px.
    expect(geom.padLeft).toBeCloseTo(64, 0)
    expect(geom.boxWidth).toBeCloseTo(geom.vw, 0)
    expect(geom.contentWidth).toBeCloseTo(geom.vw - 128, 0)
  })
})
