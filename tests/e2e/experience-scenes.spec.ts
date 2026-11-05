import { expect, type Page, test } from '@playwright/test'

const PROJECTS = ['companion', 'meals', 'sdd', 'voice', 'rag', 'text-to-image', 'sentiment']

// Put a project on the band the nav and headings share (≈ 47.5% of the viewport).
const scrollToProject = (page: Page, id: string) =>
  page.evaluate((projectId) => {
    const el = document.getElementById(projectId)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + 24 - window.innerHeight * 0.475)
  }, id)

const open = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor()
}

const scene = (page: Page, id: string) => page.locator(`[data-scene="${id}"]`)

test.describe('two-column Experience (1280×720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  for (const id of PROJECTS) {
    test(`${id} shows its own illustration, and only that one`, async ({ page }) => {
      await open(page)
      await scrollToProject(page, id)

      await expect(scene(page, id)).toHaveAttribute('data-active', 'true')
      await expect(scene(page, id).getByRole('img')).toBeVisible()
      await expect(page.locator('[data-scene][data-active="true"]')).toHaveCount(1)
      await expect(page.locator('#experience').getByRole('img')).toHaveCount(1)

      const ends = await scene(page, id).evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => 'animationName' in a)
          .map((a) => Number(a.effect?.getComputedTiming().endTime)),
      )
      expect(ends.length).toBeGreaterThan(0)
      expect(Math.max(...ends)).toBeLessThan(5000)
    })
  }

  test('text sits left, the stage sits right and stays in view through the section', async ({
    page,
  }) => {
    await open(page)
    const stage = page.getByRole('complementary', { name: /illustration/i })

    for (const id of ['companion', 'voice', 'sentiment']) {
      await scrollToProject(page, id)
      await expect(scene(page, id)).toHaveAttribute('data-active', 'true')

      const text = await page.locator(`#${id}`).boundingBox()
      const box = await stage.boundingBox()
      expect(text).not.toBeNull()
      expect(box).not.toBeNull()
      expect((text?.x ?? 0) + (text?.width ?? 0)).toBeLessThanOrEqual(box?.x ?? 0)
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(0)
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(720)
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the stage is transparent, so the backdrop shows through as it does behind the text', async ({
    page,
  }) => {
    await open(page)
    const stage = page.getByRole('complementary', { name: /illustration/i })
    await expect(stage).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(stage).toHaveCSS('box-shadow', 'none')
  })

  test('the active project is marked in the text column too', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'meals')
    await expect(page.locator('#meals')).toHaveAttribute('data-active', 'true')
    await expect(page.locator('#companion')).toHaveAttribute('data-active', 'false')
  })

  test('builds in under 5 seconds, holds, and replays on re-entry', async ({ page }) => {
    await open(page)
    const longest = (id: string) =>
      scene(page, id).evaluate((el) =>
        el.getAnimations({ subtree: true }).map((a) => ({
          name: 'animationName' in a ? (a as CSSAnimation).animationName : '',
          end: a.effect?.getComputedTiming().endTime,
          iterations: a.effect?.getComputedTiming().iterations,
        })),
      )

    await scrollToProject(page, 'voice')
    await expect(scene(page, 'voice')).toHaveAttribute('data-active', 'true')
    const first = (await longest('voice')).filter((a) => a.name)
    expect(first.length).toBeGreaterThan(0)
    for (const animation of first) {
      expect(Number(animation.end)).toBeLessThan(5000)
      expect(animation.iterations).toBe(1)
    }

    // Holding: nothing still runs once the build-in is over.
    await expect
      .poll(async () => (await longest('voice')).filter((a) => a.name).length, { timeout: 7000 })
      .toBe(0)

    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    await scrollToProject(page, 'voice')
    await expect(scene(page, 'voice')).toHaveAttribute('data-active', 'true')
    expect((await longest('voice')).filter((a) => a.name).length).toBeGreaterThan(0)
  })

  const building = (page: Page, id: string) =>
    scene(page, id).evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => 'animationName' in a).length,
    )

  test('nothing plays before you reach it, so the first scene is not spent on load', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('[data-scene][data-active="true"]')).toHaveCount(0)
    expect(await building(page, 'companion')).toBe(0)

    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    expect(await building(page, 'companion')).toBeGreaterThan(0)
  })

  test('the first scene starts when Experience reaches the band, before its project does', async ({
    page,
  }) => {
    await open(page)
    await page.locator('#experience').evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top - window.innerHeight * 0.475)
    })
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    await expect(scene(page, 'companion').getByRole('img')).toBeVisible()
    expect(await building(page, 'companion')).toBeGreaterThan(0)

    const projectTop = await page
      .locator('#companion')
      .evaluate((el) => el.getBoundingClientRect().top)
    expect(projectTop).toBeGreaterThan(720 / 2)
  })

  test('the first scene replays after scrolling back to the top', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    await expect.poll(() => building(page, 'companion'), { timeout: 7000 }).toBe(0)

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'false')

    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    expect(await building(page, 'companion')).toBeGreaterThan(0)
  })

  test('jumping to the top from a later project also starts over', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'sentiment')
    await expect(scene(page, 'sentiment')).toHaveAttribute('data-active', 'true')

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.locator('[data-scene][data-active="true"]')).toHaveCount(0)
  })

  test('a company logo and description appear when its entry reaches the band', async ({
    page,
  }) => {
    await open(page)
    const intro = (id: string) => page.locator(`#${id} header > div`).first()

    await expect(intro('wao')).toHaveCSS('opacity', '0')
    await scrollToProject(page, 'companion')
    await expect(intro('wao')).toHaveCSS('opacity', '1')
    await expect(intro('uniquify')).toHaveCSS('opacity', '0')

    await scrollToProject(page, 'rag')
    await expect(intro('uniquify')).toHaveCSS('opacity', '1')
    await expect(page.locator('#uniquify img')).toHaveJSProperty('complete', true)
    expect(
      await page.locator('#uniquify img').evaluate((el: HTMLImageElement) => el.naturalWidth),
    ).toBeGreaterThan(0)
  })

  test('reduced motion: the finished illustration, with no build-in', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page)
    await scrollToProject(page, 'rag')
    await expect(scene(page, 'rag')).toHaveAttribute('data-active', 'true')
    await expect(scene(page, 'rag').getByRole('img')).toBeVisible()

    const running = await page
      .locator('#experience')
      .evaluate(
        (el) => el.getAnimations({ subtree: true }).filter((a) => 'animationName' in a).length,
      )
    expect(running).toBe(0)
  })
})

test.describe('palette', () => {
  const tokens = (page: Page) =>
    page.evaluate(() => {
      const probe = document.createElement('span')
      document.body.appendChild(probe)
      probe.style.color = 'var(--color-accent)'
      const accent = getComputedStyle(probe).color
      probe.style.color = 'var(--color-fg)'
      const fg = getComputedStyle(probe).color
      probe.remove()
      return { accent, fg, bg: getComputedStyle(document.body).backgroundColor }
    })

  test('light is white, black, and red', async ({ page }) => {
    await open(page)
    expect(await tokens(page)).toEqual({
      bg: 'rgb(255, 255, 255)',
      fg: 'rgb(10, 10, 10)',
      accent: 'rgb(227, 6, 19)',
    })
  })

  test('dark is navy, white, and orange, via the toggle', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: /switch to dark/i }).click()
    expect(await tokens(page)).toEqual({
      bg: 'rgb(10, 26, 51)',
      fg: 'rgb(255, 255, 255)',
      accent: 'rgb(255, 122, 26)',
    })
  })
})

test.describe('phone (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the stage fills as Experience arrives, then replays after returning to the top', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('[data-scene][data-active="true"]')).toHaveCount(0)

    // The section's top is at the viewport's top, with Companion still far below the band.
    const toSectionTop = () =>
      page.locator('#experience').evaluate((el) => {
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
      })
    await toSectionTop()
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'false')

    await toSectionTop()
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    const building = await scene(page, 'companion').evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => 'animationName' in a).length,
    )
    expect(building).toBeGreaterThan(0)
  })

  test('the stage stays opaque, because the text scrolls underneath it', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('complementary', { name: /illustration/i })).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    )
  })

  test('company logos and descriptions are already showing as they scroll into view', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('#wao header > div').first()).toHaveCSS('opacity', '1')
    await expect(page.locator('#uniquify header > div').first()).toHaveCSS('opacity', '1')
  })

  test('the stage pins under the nav, scenes switch, and the page never scrolls sideways', async ({
    page,
  }) => {
    await open(page)
    const stage = page.getByRole('complementary', { name: /illustration/i })
    const navBottom = await page
      .getByRole('navigation')
      .evaluate((el) => el.getBoundingClientRect().bottom)

    for (const id of ['companion', 'voice', 'sentiment']) {
      await scrollToProject(page, id)
      await expect(scene(page, id)).toHaveAttribute('data-active', 'true')
      const box = await stage.boundingBox()
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(navBottom - 1)
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844 * 0.5)
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
