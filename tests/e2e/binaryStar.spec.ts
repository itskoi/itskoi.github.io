import { expect, type Page, test } from '@playwright/test'

const canvas = (page: Page) => page.locator('[data-lorenz-canvas]')
const frame = (page: Page) => canvas(page).evaluate((el) => (el as HTMLCanvasElement).toDataURL())

const open = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(300)
}

// Counts painted dots and how many of them carry the accent hue.
const census = (page: Page) =>
  canvas(page).evaluate((el) => {
    const c = el as HTMLCanvasElement
    const { data } = c.getContext('2d')?.getImageData(0, 0, c.width, c.height) ?? { data: [] }
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim()
    const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(accent.slice(i, i + 2), 16))
    let painted = 0
    let accented = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      painted += 1
      if (data[i] === r && data[i + 1] === g && data[i + 2] === b) accented += 1
    }
    return { painted, accented }
  })

test('paints the orbit and an accent comet', async ({ page }) => {
  await open(page)
  const { painted, accented } = await census(page)
  expect(painted).toBeGreaterThan(1000)
  expect(accented).toBeGreaterThan(50)
})

test('the comet travels with time, with no scrolling', async ({ page }) => {
  await open(page)
  const before = await frame(page)
  await page.waitForTimeout(250)
  expect(await frame(page)).not.toBe(before)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('reduced motion: a still frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page)
  const before = await frame(page)
  await page.waitForTimeout(300)
  expect(await frame(page)).toBe(before)
  expect((await census(page)).painted).toBeGreaterThan(1000)
})

test('full strength over the hero, dimmed under sharp content', async ({ page }) => {
  await open(page)
  await expect(canvas(page)).toHaveCSS('opacity', '1')
  await page.locator('#publications').evaluate((el) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
  })
  await expect(canvas(page)).toHaveCSS('opacity', '0.4')
})

test('blurs while Experience is the active section, and only then', async ({ page }) => {
  const scrollToMiddleOf = (id: string) =>
    page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + el.offsetHeight / 2 - window.innerHeight * 0.475)
    }, id)

  await open(page)
  await expect(canvas(page)).toHaveCSS('filter', 'none')
  await scrollToMiddleOf('experience')
  await expect(canvas(page)).toHaveCSS('filter', 'blur(6px)')
  await expect(canvas(page)).toHaveCSS('opacity', '1')
  await scrollToMiddleOf('publications')
  await expect(canvas(page)).toHaveCSS('filter', 'none')
})

test('dark theme repaints in orange', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: /switch to dark/i }).click()
  await page.waitForTimeout(300)
  expect((await census(page)).accented).toBeGreaterThan(50)
})
