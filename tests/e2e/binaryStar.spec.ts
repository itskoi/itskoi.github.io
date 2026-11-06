import { expect, type Page, test } from '@playwright/test'

const canvas = (page: Page) => page.locator('[data-binary-star-canvas]')
const frame = (page: Page) => canvas(page).evaluate((el) => (el as HTMLCanvasElement).toDataURL())

// The binary star is the paper scene; dark is the default, so store the paper choice.
test.beforeEach(({ page }) => page.addInitScript(() => localStorage.setItem('theme', 'light')))

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

test('draws one star in red and the other in black, and nothing else', async ({ page }) => {
  await open(page)
  const { red, black, other } = await canvas(page).evaluate((el) => {
    const c = el as HTMLCanvasElement
    const { data } = c.getContext('2d')?.getImageData(0, 0, c.width, c.height) ?? { data: [] }
    let red = 0
    let black = 0
    let other = 0
    // Fainter pixels round too coarsely to carry a reliable hue.
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 64) continue
      if (data[i] > 150 && data[i + 1] < 60 && data[i + 2] < 60) red += 1
      else if (data[i] < 60 && data[i + 1] < 60 && data[i + 2] < 60) black += 1
      else other += 1
    }
    return { red, black, other }
  })
  expect(red).toBeGreaterThan(1000)
  expect(black).toBeGreaterThan(500)
  // A red dot over a black one, or the reverse, mixes the two at their edges.
  expect(other).toBeLessThan((red + black) * 0.02)
})

test('the stars and the head of their trails reach full strength', async ({ page }) => {
  await open(page)
  const strong = await canvas(page).evaluate((el) => {
    const c = el as HTMLCanvasElement
    const { data } = c.getContext('2d')?.getImageData(0, 0, c.width, c.height) ?? { data: [] }
    let count = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] >= 230) count += 1 // 90% opacity
    return count
  })
  expect(strong).toBeGreaterThan(500)
})

test('paints the trails and solid accent', async ({ page }) => {
  await open(page)
  const { painted, accented } = await census(page)
  expect(painted).toBeGreaterThan(1000)
  expect(accented).toBeGreaterThan(50)
})

test('the stars are halftone dots, not solid circles', async ({ page }) => {
  await open(page)
  const longestRun = await canvas(page).evaluate((el) => {
    const c = el as HTMLCanvasElement
    const { data } = c.getContext('2d')?.getImageData(0, 0, c.width, c.height) ?? { data: [] }
    let longest = 0
    for (let y = 0; y < c.height; y++) {
      let run = 0
      for (let x = 0; x < c.width; x++) {
        run = data[(y * c.width + x) * 4 + 3] >= 230 ? run + 1 : 0
        longest = Math.max(longest, run)
      }
    }
    return longest
  })
  expect(longestRun).toBeGreaterThan(2)
  // A solid heavy star would run about 75px; its largest dot is about 7px wide.
  expect(longestRun).toBeLessThan(12)
})

test('a star field shows away from the figure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await open(page)
  const stars = await canvas(page).evaluate((el) => {
    const c = el as HTMLCanvasElement
    const { data } = c.getContext('2d')?.getImageData(0, 0, 400, 300) ?? { data: [] }
    let count = 0
    // Stronger than the background grid's dots, whose alpha stays near 30.
    for (let i = 3; i < data.length; i += 4) if (data[i] >= 64) count += 1
    return count
  })
  expect(stars).toBeGreaterThan(5)
})

test('the stars travel with time, with no scrolling', async ({ page }) => {
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
  await expect(canvas(page)).toHaveCSS('opacity', '0.4')
  await scrollToMiddleOf('publications')
  await expect(canvas(page)).toHaveCSS('filter', 'none')
})

test('toggling the theme swaps the figure: binary stars on paper, black hole on dark', async ({
  page,
}) => {
  const blackHole = page.locator('[data-black-hole-canvas]')
  await open(page)
  await expect(canvas(page)).toBeAttached()
  await expect(blackHole).toHaveCount(0)

  await page.getByRole('button', { name: /switch to dark/i }).click()
  await expect(blackHole).toBeAttached()
  await expect(page.locator('canvas')).toHaveCount(1)

  await page.getByRole('button', { name: /switch to light/i }).click()
  await expect(canvas(page)).toBeAttached()
  await expect(page.locator('canvas')).toHaveCount(1)
})
