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
      // Pinned at 4rem: anything less means the section's end is pushing the stage up.
      expect(box?.y ?? -1).toBeCloseTo(64, 0)
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(720)
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the last project is followed only by the room the pinned stage needs', async ({ page }) => {
    await open(page)
    const gap = await page.evaluate(() => {
      const top = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? 0
      return top('education') - top('sentiment')
    })
    // The title on the band's middle to the screen's bottom edge: 52.5% of 720, plus 24px.
    expect(gap).toBeLessThanOrEqual(403)
  })

  test('the stage is transparent, so the backdrop shows through as it does behind the text', async ({
    page,
  }) => {
    await open(page)
    const stage = page.getByRole('complementary', { name: /illustration/i })
    await expect(stage).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(stage).toHaveCSS('box-shadow', 'none')
  })

  test('a project shows its title, and its details only after clicking Read details', async ({
    page,
  }) => {
    await open(page)
    const project = page.locator('#meals')
    const body = project.locator('details p').first()
    const stack = project.locator('details ul')

    await expect(project.getByRole('heading', { level: 4 })).toBeVisible()
    await expect(body).toBeHidden()
    await expect(stack).toBeHidden()

    await project.getByText('Read details').click()
    await expect(body).toBeVisible()
    await expect(stack).toBeVisible()

    await project.getByText('Read details').click()
    await expect(body).toBeHidden()
  })

  test('the wheel still reaches the page end once opened details make it taller', async ({
    page,
  }) => {
    await open(page)
    const pageHeight = () => page.evaluate(() => document.documentElement.scrollHeight)
    const collapsed = await pageHeight()
    for (const id of PROJECTS) await page.locator(`#${id} summary`).click()
    const expanded = await pageHeight()
    expect(expanded).toBeGreaterThan(collapsed)

    await page.mouse.move(640, 360)
    // Lenis picks up the new height after a short debounce, so keep wheeling until it has.
    await expect
      .poll(async () => {
        await page.mouse.wheel(0, 100000)
        return page.evaluate(() => window.scrollY + window.innerHeight)
      })
      .toBeGreaterThanOrEqual(expanded - 1)
  })

  test('the wheel slows on a collapsed project and recovers once it is opened', async ({
    page,
  }) => {
    await open(page)
    await scrollToProject(page, 'meals')
    await expect(scene(page, 'meals')).toHaveAttribute('data-active', 'true')
    const summary = page.locator('#meals summary')
    await summary.hover()

    const wheelTravel = async () => {
      const from = await page.evaluate(() => window.scrollY)
      await page.mouse.wheel(0, 60)
      await page.waitForTimeout(1500)
      return (await page.evaluate(() => window.scrollY)) - from
    }

    const collapsed = await wheelTravel()
    await summary.click()
    const opened = await wheelTravel()
    expect(collapsed).toBeGreaterThan(0)
    expect(collapsed).toBeLessThan(opened * 0.5)
  })

  test('projects are indented under their role, with no gap between titles', async ({ page }) => {
    await open(page)
    const role = await page.locator('#wao h3').boundingBox()
    const companion = await page.locator('#companion').boundingBox()
    const meals = await page.locator('#meals').boundingBox()
    expect(companion?.x ?? 0).toBeGreaterThan(role?.x ?? 0)
    expect(companion?.height ?? 720).toBeLessThan(720 * 0.3)
    expect(meals?.y ?? 0).toBeCloseTo((companion?.y ?? 0) + (companion?.height ?? 0), 0)
  })

  test('the active project is marked in the text column too', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'meals')
    await expect(page.locator('#meals')).toHaveAttribute('data-active', 'true')
    await expect(page.locator('#companion')).toHaveAttribute('data-active', 'false')
  })

  test('clicking a project title scrolls to it and shows its illustration', async ({ page }) => {
    await open(page)
    await page.locator('#voice h4 a').click()
    await expect(scene(page, 'voice')).toHaveAttribute('data-active', 'true')
    await expect(page.locator('#voice')).toBeInViewport()
  })

  test('companion can be paused and stepped', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'companion')
    const companion = scene(page, 'companion')
    await expect(companion).toHaveAttribute('data-active', 'true')
    const where = companion.getByRole('status')

    await companion.getByRole('button', { name: 'Pause' }).click()
    await expect(where).toHaveText('Input')
    await companion.getByRole('button', { name: 'Next' }).click()
    await expect(where).toHaveText('Step 1 / 7')
    await expect(companion.getByRole('img')).toContainText('STEP 1 / 7 · INPUT GUARDRAIL')
    await page.waitForTimeout(2500)
    await expect(where).toHaveText('Step 1 / 7')
    // Paused stops the steps, not the drawing: the step must be fully drawn, not frozen invisible.
    await expect(companion.getByText(/^STEP 1 \/ 7/)).toHaveCSS('opacity', '1')
    await expect(companion.getByText('guardrail', { exact: true })).toHaveCSS('opacity', '1')

    await companion.getByRole('button', { name: 'Play' }).click()
    await expect(where).toHaveText('Step 2 / 7', { timeout: 3000 })
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

    // Voice plays its steps (specs/project-io-scenes), then holds on its result with nothing running.
    const where = scene(page, 'voice').getByRole('status')
    await expect(where).toHaveText('Result', { timeout: 15000 })
    await expect
      .poll(async () => (await longest('voice')).filter((a) => a.name).length, { timeout: 5000 })
      .toBe(0)

    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    await scrollToProject(page, 'voice')
    await expect(scene(page, 'voice')).toHaveAttribute('data-active', 'true')
    await expect(where).toHaveText('Input')
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
    // Companion plays in steps (specs/project-io-scenes), so starting over means back on its input.
    const where = scene(page, 'companion').getByRole('status')
    await expect(where).toHaveText('Step 1 / 7', { timeout: 3000 })

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'false')

    await scrollToProject(page, 'companion')
    await expect(scene(page, 'companion')).toHaveAttribute('data-active', 'true')
    await expect(where).toHaveText('Input')
    expect(await building(page, 'companion')).toBeGreaterThan(0)
  })

  test('jumping to the top from a later project also starts over', async ({ page }) => {
    await open(page)
    await scrollToProject(page, 'sentiment')
    await expect(scene(page, 'sentiment')).toHaveAttribute('data-active', 'true')

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.locator('[data-scene][data-active="true"]')).toHaveCount(0)
  })

  test('projects are divided by dashed rules, companies by solid ones', async ({ page }) => {
    await open(page)
    await expect(page.locator('#meals')).toHaveCSS('border-top-style', 'dashed')
    await expect(page.locator('#uniquify')).toHaveCSS('border-top-style', 'solid')
  })

  test('a note lines up with the projects above it', async ({ page }) => {
    await open(page)
    const note = page.getByText(/^Built AI training modules/)
    const project = await page.locator('#text-to-image').boundingBox()
    const box = await note.boundingBox()
    expect(box?.x).toBe(project?.x)
    await expect(note).toHaveCSS('border-top-style', 'dashed')
  })

  test('company logos have rounded corners', async ({ page }) => {
    await open(page)
    const logos = page.locator('#experience article img')
    expect(await logos.count()).toBeGreaterThan(0)
    for (const logo of await logos.all()) await expect(logo).toHaveCSS('border-radius', '8px')
  })

  test('a company logo and description always show', async ({ page }) => {
    await open(page)
    const visibility = (id: string) =>
      page.locator(`#${id} header > div > *`).evaluateAll((els) =>
        els.map((el) => {
          let opacity = 1
          for (let node: Element | null = el; node; node = node.parentElement) {
            opacity *= Number(getComputedStyle(node).opacity)
          }
          return opacity
        }),
      )

    for (const id of ['wao', 'uniquify', 'clc']) expect(await visibility(id)).toEqual([1, 1])
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

  test('light is white, black, and red, via the toggle', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: /switch to light/i }).click()
    expect(await tokens(page)).toEqual({
      bg: 'rgb(255, 255, 255)',
      fg: 'rgb(10, 10, 10)',
      accent: 'rgb(227, 6, 19)',
    })
  })

  test('dark is black, white, and red by default', async ({ page }) => {
    await open(page)
    expect(await tokens(page)).toEqual({
      bg: 'rgb(0, 0, 0)',
      fg: 'rgb(255, 255, 255)',
      accent: 'rgb(255, 31, 31)',
    })
  })
})

test('Read details is the muted gray in both themes', async ({ page }) => {
  await open(page)
  const summary = page.getByText('Read details').first()
  await expect(summary).toHaveCSS('color', 'rgb(163, 163, 163)')
  await page.getByRole('button', { name: /switch to light/i }).click()
  await expect(summary).toHaveCSS('color', 'rgb(85, 89, 95)')
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
      'rgb(0, 0, 0)',
    )
  })

  test('company logos and descriptions are already showing as they scroll into view', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('#wao header > div > p')).toHaveCSS('opacity', '1')
    await expect(page.locator('#uniquify header > div > p')).toHaveCSS('opacity', '1')
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
