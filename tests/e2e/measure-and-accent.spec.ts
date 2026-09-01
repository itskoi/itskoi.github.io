import { expect, type Page, test } from '@playwright/test'

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

const SECTION_IDS = ['experience', 'education', 'publications', 'technologies'] as const

// Colors resolve through a probe element so the assertions hold in either theme.
const tokenColor = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    document.body.appendChild(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, token)

const headingColor = (page: Page, id: string) =>
  page.locator(`#${id}-heading`).evaluate((el) => getComputedStyle(el).color)

// Put the section's middle on the thin band the nav and headings share
// (rootMargin -45% 0px -50% 0px ≈ 47.5% of the viewport height).
const scrollSectionToBand = (page: Page, id: string) =>
  page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const target = top + el.offsetHeight / 2 - window.innerHeight * 0.475
    window.scrollTo(0, Math.max(0, target))
  }, id)

test.describe('heading accent follows the reading position', () => {
  test('no heading is red before you scroll', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const ink = await tokenColor(page, '--color-fg')
    for (const id of SECTION_IDS) {
      expect(await headingColor(page, id)).toBe(ink)
    }
  })

  for (const id of SECTION_IDS) {
    test(`${id}'s heading fades to the accent red while it crosses the band — and only it`, async ({
      page,
    }) => {
      await page.goto('/')
      await page.getByRole('heading', { level: 1 }).waitFor()

      const accent = await tokenColor(page, '--color-accent')
      const ink = await tokenColor(page, '--color-fg')
      await scrollSectionToBand(page, id)

      // The fade runs 0.4s — poll past it.
      await expect.poll(() => headingColor(page, id), { timeout: 3000 }).toBe(accent)
      for (const other of SECTION_IDS) {
        if (other !== id) {
          expect(await headingColor(page, other)).toBe(ink)
        }
      }
    })
  }

  test('reduced motion: the color still flips, instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor()

    const accent = await tokenColor(page, '--color-accent')
    await scrollSectionToBand(page, 'experience')
    await expect.poll(() => headingColor(page, 'experience'), { timeout: 3000 }).toBe(accent)

    const duration = await page
      .locator('#experience-heading')
      .evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(duration).toBe('0s')
  })
})
