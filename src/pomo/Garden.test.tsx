import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playWaterSound } from './alert'
import { Garden, STEP_MS } from './Garden'
import { layout } from './garden-layout'
import type { Species, Tree } from './session'

vi.mock('./alert', () => ({ playWaterSound: vi.fn() }))

const SPECIES: Species[] = ['phuong', 'mai', 'dao', 'da', 'tre', 'dua']
const makeTrees = (n: number, stage = 3): Tree[] =>
  Array.from({ length: n }, (_, i) => ({ plantedAt: i, stage, species: SPECIES[i % 6] }))

beforeEach(() => vi.mocked(playWaterSound).mockClear())

const show = (trees: Tree[]) => render(<Garden trees={trees} />)
const treeButtons = () => screen.getAllByRole('button', { name: /^Water this/ })
const focused = () => document.activeElement?.getAttribute('aria-label')

describe('drawing', () => {
  it('says so when the garden is empty', () => {
    const { container } = show([])
    expect(screen.getByText(/garden is empty/i)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('labels every tree with its species and stage', () => {
    show([
      { plantedAt: 1, stage: 3, species: 'phuong' },
      { plantedAt: 2, stage: 0, species: 'mai' },
      { plantedAt: 3, stage: 1, species: 'dao' },
      { plantedAt: 4, stage: 2, species: 'da' },
    ])
    expect(treeButtons()).toHaveLength(4)
    screen.getByRole('button', { name: 'Water this Phượng mature' })
    screen.getByRole('button', { name: 'Water this Mai seed, from an abandoned session' })
    screen.getByRole('button', { name: 'Water this Đào sprout, from an abandoned session' })
    screen.getByRole('button', { name: 'Water this Đa sapling, from an abandoned session' })
  })

  it('draws each tree at its own species and stage', () => {
    show([{ plantedAt: 1, stage: 2, species: 'tre' }])
    const tree = treeButtons()[0]
    expect(tree.querySelector('use')).toHaveAttribute('href', '#tree-tre-2')
  })

  it.each([
    ['the Corgi', '[data-pet="corgi"]', 3],
    ['the White cat', '[data-pet="white"]', 5],
    ['the Shiba', '[data-pet="shiba"]', 8],
    ['the Yellow cat', '[data-pet="yellow"]', 11],
    ['the Black cat', '[data-pet="black"]', 14],
    ['the Golden retriever', '[data-pet="golden"]', 17],
    ['butterflies', '.flap', 7],
    ['birds', '.fly', 10],
    ['koi', '.swim', 16],
    ['an egret', 'use[href="#egret"]', 16],
    ['bees on the ground', '.visit.bee', 7],
    ['the Buffalo', '[data-pet="buffalo"]', 17],
    ['the Bear', '[data-pet="bear"]', 21],
    ['the Monkey', '[data-pet="monkey"]', 26],
    ['the Elephant', '[data-pet="elephant"]', 32],
    ['a flower bed', 'use[href="#flowers"]', 17],
    ['tall grass', 'use[href="#reeds"]', 32],
    ['a boulder', 'use[href="#boulder"]', 33],
    ['the tower', '[data-feature="tower"]', 25],
    ['a stone lantern', '[data-feature="lantern"]', 31],
    ['a lily pond', '[data-feature="lilypond"] .bob', 34],
    ['a torii gate', '[data-feature="torii"]', 77],
    ['fireflies', '.night.firefly', 7],
    ['dragonflies', '.dragonfly', 32],
  ])('brings %s (%s) only once they have arrived', (_, selector, count) => {
    const before = show(makeTrees(count - 1))
    expect(before.container.querySelector(selector)).toBeNull()
    before.unmount()
    const after = show(makeTrees(count))
    expect(after.container.querySelector(selector)).not.toBeNull()
  })

  it('sends flocks across the sky in every direction, each bird facing its way', () => {
    const { container } = show(makeTrees(10))
    const birds = [...container.querySelectorAll<SVGGElement>('.fly')]
    const ways = new Set(
      birds.map((bird) => {
        const dx = Number.parseFloat(bird.style.getPropertyValue('--dx'))
        const dy = Number.parseFloat(bird.style.getPropertyValue('--dy'))
        const facing = bird.firstElementChild?.getAttribute('transform')?.match(/scale\((-?)/)?.[1]
        expect(facing === '-').toBe(dx < 0)
        return `${Math.sign(dx)},${Math.sign(dy)}`
      }),
    )
    expect(ways).toEqual(new Set(['1,-1', '1,1', '-1,1', '-1,-1']))
  })

  it('never lets the garden shrink below 28 pixels a plot', () => {
    const { container } = show(makeTrees(300))
    const svg = screen.getByRole('group', { name: /^Garden/ })
    const world = container.querySelector('.world') as HTMLElement
    const [, , w, h] = (svg.getAttribute('viewBox') as string).split(' ').map(Number)
    const minWidth = Number.parseInt(world.style.minWidth, 10)
    const minHeight = Number.parseInt(world.style.minHeight, 10)
    // The plot's size follows whichever of width and height is tighter, so both need a floor.
    expect(Math.min(minWidth / w, minHeight / h) * 64).toBeGreaterThanOrEqual(28)
  })
})

describe('keyboard', () => {
  it('has one Tab stop for all the trees', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Garden trees={makeTrees(5)} />
        <button type="button">After the garden</button>
      </>,
    )
    const stops = treeButtons().filter((t) => t.getAttribute('tabindex') === '0')
    expect(stops).toHaveLength(1)
    await user.tab()
    expect(document.activeElement).toBe(stops[0])
    await user.tab()
    expect(screen.getByRole('button', { name: 'Rotate garden' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'After the garden' })).toHaveFocus()
  })

  it('moves through planting order with arrow keys and stops at the ends', async () => {
    const user = userEvent.setup()
    show(makeTrees(3))
    await user.tab()
    expect(focused()).toBe('Water this Phượng mature')
    await user.keyboard('{ArrowRight}')
    expect(focused()).toBe('Water this Mai mature')
    await user.keyboard('{ArrowDown}')
    expect(focused()).toBe('Water this Đào mature')
    await user.keyboard('{ArrowRight}')
    expect(focused()).toBe('Water this Đào mature')
    await user.keyboard('{ArrowLeft}{ArrowUp}{ArrowUp}')
    expect(focused()).toBe('Water this Phượng mature')
    expect(treeButtons().filter((t) => t.getAttribute('tabindex') === '0')).toHaveLength(1)
  })

  it.each(['{Enter}', ' '])('waters with %j without changing the trees', async (key) => {
    const user = userEvent.setup()
    const trees = makeTrees(2, 1)
    const before = structuredClone(trees)
    const { container } = show(trees)
    await user.tab()
    await user.keyboard(key)
    const tree = screen.getByRole('button', { name: /Phượng/ })
    expect(tree.querySelector('.can')).not.toBeNull()
    expect(tree.querySelector('.drops')).not.toBeNull()
    expect(tree.querySelector('.wet')).not.toBeNull()
    expect(container.querySelectorAll('.can')).toHaveLength(1)
    expect(trees).toEqual(before)
    expect(within(tree).queryByRole('button')).toBeNull()
    expect(tree.querySelector('.art use')).toHaveAttribute('href', '#tree-phuong-1')
    expect(screen.getByText(/^Watered the Phượng sprout/)).toBeInTheDocument()
  })
})

describe('watering', () => {
  it('plays the water sound once per watering', () => {
    show(makeTrees(2))
    fireEvent.click(treeButtons()[0])
    fireEvent.click(treeButtons()[0])
    expect(playWaterSound).toHaveBeenCalledTimes(1)
    fireEvent.click(treeButtons()[1])
    expect(playWaterSound).toHaveBeenCalledTimes(2)
  })

  it('waters on click and clears away afterwards', () => {
    vi.useFakeTimers()
    try {
      const { container } = show(makeTrees(2))
      fireEvent.click(treeButtons()[1])
      expect(treeButtons()[1].querySelector('.can')).not.toBeNull()
      act(() => {
        vi.advanceTimersByTime(2600)
      })
      expect(container.querySelector('.can')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('view only', () => {
  it('shows the trees with their labels but cannot focus or water them', () => {
    const { container } = render(<Garden trees={makeTrees(3)} canWater={false} />)
    expect(screen.queryAllByRole('button', { name: /^Water/ })).toEqual([])
    screen.getByRole('button', { name: 'Rotate garden' })
    expect(screen.getByRole('img', { name: 'Phượng mature' })).toBeInTheDocument()
    expect(container.querySelector('[tabindex]')).toBeNull()
    fireEvent.click(screen.getByRole('img', { name: 'Phượng mature' }))
    expect(container.querySelector('.can')).toBeNull()
    expect(playWaterSound).not.toHaveBeenCalled()
  })
})

const rotate = () => fireEvent.click(screen.getByRole('button', { name: 'Rotate garden' }))
const numbers = (text: string | null) => (String(text).match(/-?[\d.]+/g) as string[]).map(Number)
const quarterTurn = ([x, y]: number[]) => [0 - 2 * y, x / 2]

describe('rotating', () => {
  const trees = () =>
    treeButtons()
      .sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i))
      .map((t) => numbers(t.getAttribute('transform')))

  it('has nothing to rotate in an empty garden', () => {
    show([])
    expect(screen.queryByRole('button', { name: 'Rotate garden' })).toBeNull()
  })

  it('moves every tree a quarter turn, and home after four', () => {
    show(makeTrees(12))
    const home = trees()
    rotate()
    expect(trees()).toEqual(home.map(quarterTurn))
    rotate()
    rotate()
    rotate()
    expect(trees()).toEqual(home)
  })

  it.each([1, 2, 3])('draws nearer things over farther ones after %i turns', (turns) => {
    const { container } = show(makeTrees(40))
    for (let i = 0; i < turns; i++) rotate()
    const ascending = (values: number[]) =>
      expect(values).toEqual([...values].sort((a, b) => a - b))
    ascending(
      [...container.querySelectorAll('[data-i]')].map(
        (t) => numbers(t.getAttribute('transform'))[1],
      ),
    )
    ascending(
      [...container.querySelectorAll('.island > g:first-child use')].map((u) =>
        Number(u.getAttribute('y')),
      ),
    )
  })

  it('keeps the frame still from every side', () => {
    show(makeTrees(12))
    const frame = () => screen.getByRole('group', { name: /^Garden/ }).getAttribute('viewBox')
    const first = frame()
    for (let i = 0; i < 3; i++) {
      rotate()
      expect(frame()).toBe(first)
    }
  })

  it('leaves animals on their plots, drawn at their new depth', () => {
    const { container } = show(makeTrees(20))
    const pets = () =>
      [...container.querySelectorAll<SVGGElement>('[data-pet]')]
        .sort((a, b) => (a.dataset.pet as string).localeCompare(b.dataset.pet as string))
        .map((el) => numbers(el.style.transform))
    const home = pets()
    rotate()
    expect(pets()).toEqual(home.map(quarterTurn))
    for (const el of container.querySelectorAll<SVGGElement>('[data-pet]')) {
      expect(el.closest('[data-depth]')).toHaveAttribute(
        'data-depth',
        `${numbers(el.style.transform)[1] / 16}`,
      )
    }
  })

  it('turns a pet to face where it walks on screen', () => {
    vi.useFakeTimers()
    try {
      const { container } = show(makeTrees(3))
      rotate()
      const corgi = () => container.querySelector('[data-pet="corgi"]') as SVGGElement
      const x = () => numbers(corgi().style.transform)[0]
      for (let step = 0; step < 60; step++) {
        const before = x()
        act(() => void vi.advanceTimersByTime(STEP_MS))
        if (x() === before) continue
        const turned = corgi().querySelector('[transform="scale(-1 1)"]') !== null
        expect(turned).toBe(x() > before)
      }
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('floating', () => {
  it('keeps the shadow in its own layer, under the island that floats', () => {
    const { container } = show(makeTrees(3))
    const [shadow, island] = container.querySelectorAll('.world > svg')
    expect(shadow).toHaveClass('island-shadow')
    expect(shadow.querySelector('path')).not.toBeNull()
    expect(island).toHaveClass('island')
    expect(island.querySelectorAll('[role="button"]')).toHaveLength(3)
    expect(shadow).toHaveAttribute('viewBox', island.getAttribute('viewBox'))
  })
})

describe('tree motion', () => {
  const one = (species: Species, stage: number) => [{ plantedAt: 1, stage, species }]

  it('sways trees past the seed stage', () => {
    expect(show(one('da', 1)).container.querySelector('.t .breeze use')).not.toBeNull()
    expect(show(one('da', 0)).container.querySelector('.breeze')).toBeNull()
  })

  it('only sways the oldest 24 trees of a big garden', () => {
    const { container } = show(makeTrees(60))
    expect(container.querySelectorAll('.breeze')).toHaveLength(24)
    expect(container.querySelector('[data-i="23"] .breeze')).not.toBeNull()
    expect(container.querySelector('[data-i="24"] .breeze')).toBeNull()
  })

  it.each(['phuong', 'mai', 'dao', 'da', 'banglang', 'bang'] as const)(
    'sheds from a mature %s',
    (id) => {
      expect(show(one(id, 3)).container.querySelector('.t .petal')).not.toBeNull()
    },
  )

  it('sheds nothing from a young tree or an evergreen', () => {
    expect(show(one('mai', 2)).container.querySelector('.petal')).toBeNull()
    expect(show(one('thong', 3)).container.querySelector('.petal')).toBeNull()
  })

  it('only sheds from the oldest 24 trees', () => {
    const trees = Array.from(
      { length: 30 },
      (_, i): Tree => ({
        plantedAt: i,
        stage: 3,
        species: 'mai',
      }),
    )
    const { container } = show(trees)
    expect(container.querySelector('[data-i="23"] .petal')).not.toBeNull()
    expect(container.querySelector('[data-i="24"] .petal')).toBeNull()
  })
})

describe('pets walking', () => {
  const drawn = (container: HTMLElement) =>
    [...container.querySelectorAll<SVGGElement>('[data-pet]')].map((el) => {
      const [x, y] = (el.style.transform.match(/-?[\d.]+/g) as string[]).map(Number)
      return { pet: el.dataset.pet as string, gx: (x / 32 + y / 16) / 2, gy: (y / 16 - x / 32) / 2 }
    })
  const spots = (container: HTMLElement) =>
    drawn(container)
      .sort((a, b) => a.pet.localeCompare(b.pet))
      .map((p) => `${p.gx},${p.gy}`)

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('walks pets one plot at a time over open grass, never two on a plot', () => {
    const trees = makeTrees(20)
    const { container } = show(trees)
    const plots = layout(trees)
    let before = spots(container)
    const visited = new Set(before)
    for (let step = 0; step < 200; step++) {
      act(() => void vi.advanceTimersByTime(STEP_MS))
      const now = spots(container)
      expect(new Set(now).size).toBe(7)
      const moved = now.flatMap((at, i) => (at === before[i] ? [] : [[at, before[i]]]))
      expect(moved.length).toBeLessThanOrEqual(1)
      for (const [to, from] of moved) {
        const [gx, gy] = to.split(',').map(Number)
        const [fx, fy] = from.split(',').map(Number)
        expect(Math.max(Math.abs(gx - fx), Math.abs(gy - fy))).toBe(1)
        expect(plots.find((p) => p.gx === gx && p.gy === gy)?.kind).toBe('grass')
        // A walking pet is drawn at the nearer of the two plots.
        const walker = container.querySelector('.step') as SVGGElement
        expect(walker.closest('[data-depth]')).toHaveAttribute(
          'data-depth',
          `${Math.max(gx + gy, fx + fy)}`,
        )
        visited.add(to)
      }
      before = now
      for (const el of container.querySelectorAll<SVGGElement>('[data-pet]:not(.step)')) {
        const pet = drawn(container).find((p) => p.pet === el.dataset.pet)
        expect(el.closest('[data-depth]')).toHaveAttribute(
          'data-depth',
          `${(pet?.gx ?? 0) + (pet?.gy ?? 0)}`,
        )
      }
    }
    expect(visited.size).toBeGreaterThan(7)
  })

  it('draws pets among the trees, nearer things covering farther ones', () => {
    const { container } = show(makeTrees(40))
    const items = [...container.querySelectorAll<SVGGElement>('[data-i], [data-pet]')].map((el) => {
      const text = el.getAttribute('transform') ?? el.style.transform
      return { pet: el.hasAttribute('data-pet'), depth: Number(text.match(/-?[\d.]+/g)?.[1]) / 16 }
    })
    const depths = items.map((item) => item.depth)
    expect(depths).toEqual([...depths].sort((a, b) => a - b))
    expect(items.some((item, i) => item.pet && items[i + 1]?.pet === false)).toBe(true)
  })

  it('leaves every other animation running when one pet takes a step', () => {
    const { container } = show(makeTrees(40))
    const running = [...container.querySelectorAll('.fly, .swim, .flap, .visit, .breathe')].filter(
      (el) => !el.closest('[data-pet="corgi"]'),
    )
    expect(running.length).toBeGreaterThan(10)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    act(() => void vi.advanceTimersByTime(STEP_MS))
    random.mockRestore()
    expect(container.querySelector('[data-pet="corgi"].step')).not.toBeNull()
    expect(running.filter((el) => !el.isConnected)).toEqual([])
  })

  it('stops walking when the step ends', () => {
    const { container } = show(makeTrees(3))
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    act(() => void vi.advanceTimersByTime(STEP_MS))
    random.mockRestore()
    fireEvent.animationEnd(container.querySelector('.hop') as Element)
    expect(container.querySelector('.step')).toBeNull()
  })

  it('hops only the pet that is walking', () => {
    const { container } = show(makeTrees(3))
    expect(container.querySelector('.hop')).toBeNull()
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    act(() => void vi.advanceTimersByTime(STEP_MS))
    random.mockRestore()
    expect(container.querySelector('[data-pet="corgi"].life.step > .hop')).not.toBeNull()
  })

  it('shows the walking pose only on a step, and turns a pet to face where it walks', () => {
    const { container } = show(makeTrees(3))
    const corgi = () => container.querySelector('[data-pet="corgi"]') as SVGGElement
    expect(corgi().querySelector('.sit')).not.toBeNull()
    expect(corgi().querySelector('.walk')).not.toBeNull()
    expect(corgi()).not.toHaveClass('step')
    const x = () => Number((corgi().style.transform.match(/-?[\d.]+/) as string[])[0])
    for (let step = 0; step < 60; step++) {
      const before = x()
      act(() => void vi.advanceTimersByTime(STEP_MS))
      if (x() === before) continue
      const turned = corgi().querySelector('[transform="scale(-1 1)"]') !== null
      expect(turned).toBe(x() > before)
    }
  })

  it('keeps pets on their plots under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { container } = show(makeTrees(20))
    const home = spots(container)
    act(() => void vi.advanceTimersByTime(STEP_MS * 50))
    expect(spots(container)).toEqual(home)
  })
})

describe('reduced motion', () => {
  it('marks every moving part so one rule can stop them all', () => {
    const { container } = show(makeTrees(20))
    for (const selector of [
      '.fly',
      '.swim',
      '.flap',
      '.breathe',
      '.blink',
      '.breeze',
      '.petal',
      '.hop',
      '.step',
      '.stride',
      '.visit',
      '.air',
      '.rest',
      '.fan',
    ]) {
      for (const el of container.querySelectorAll(selector)) {
        expect(el.closest('.life')).not.toBeNull()
      }
    }
  })
})

describe('the tower', () => {
  const blocks = (n: number) => show(makeTrees(n)).container.querySelectorAll('.sweep').length
  const top = (n: number) =>
    Number(
      show(makeTrees(n)).container.querySelector('.island')?.getAttribute('viewBox')?.split(' ')[1],
    )

  it('stands two blocks tall at 25 trees, three at 50 and five at 100', () => {
    expect([blocks(25), blocks(50), blocks(100)]).toEqual([2, 3, 5])
  })

  it('makes room in the frame for its searchlights', () => {
    expect(top(25)).toBeLessThan(top(24))
  })

  it('marks every new moving part so reduced motion stops it', () => {
    const { container } = show(makeTrees(100))
    for (const selector of [
      '.pulse',
      '.tip',
      '.drip',
      '.bob',
      '.lamp',
      '.sweep',
      '.beam',
      '.wave',
    ]) {
      const parts = [...container.querySelectorAll(selector)]
      expect(parts.length).toBeGreaterThan(0)
      for (const el of parts) expect(el.closest('.life')).not.toBeNull()
    }
  })
})

describe('tree count', () => {
  it('shows how many trees the garden has', () => {
    const { rerender } = show(makeTrees(1))
    screen.getByText('1 tree')
    rerender(<Garden trees={makeTrees(30)} />)
    screen.getByText('30 trees')
  })
})

describe('zooming', () => {
  const world = (container: HTMLElement) => container.querySelector('.world') as HTMLElement
  const zoomIn = () => screen.getByRole('button', { name: 'Zoom in' })
  const zoomOut = () => screen.getByRole('button', { name: 'Zoom out' })

  it('zooms in and out with the buttons, between 1x and 4x', () => {
    const { container } = show(makeTrees(3))
    expect(world(container).style.width).toBe('100%')
    expect(zoomOut()).toBeDisabled()
    fireEvent.click(zoomIn())
    expect(world(container).style.width).toBe('125%')
    for (let i = 0; i < 10; i++) fireEvent.click(zoomIn())
    expect(world(container).style.width).toBe('400%')
    expect(zoomIn()).toBeDisabled()
    for (let i = 0; i < 10; i++) fireEvent.click(zoomOut())
    expect(world(container).style.width).toBe('100%')
  })

  it('zooms with the wheel instead of scrolling the page', () => {
    const { container } = show(makeTrees(3))
    const scroller = container.querySelector('.scroller') as HTMLElement
    const up = new WheelEvent('wheel', { deltaY: -100, cancelable: true, bubbles: true })
    act(() => {
      scroller.dispatchEvent(up)
    })
    expect(up.defaultPrevented).toBe(true)
    expect(Number.parseFloat(world(container).style.width)).toBeGreaterThan(100)
    act(() => {
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 1000, bubbles: true }))
    })
    expect(world(container).style.width).toBe('100%')
  })

  it('pans on a mouse drag without watering the tree it ends on', () => {
    // jsdom has no PointerEvent, so fireEvent would drop the mouse fields.
    vi.stubGlobal('PointerEvent', MouseEvent)
    const { container } = show(makeTrees(3))
    const scroller = container.querySelector('.scroller') as HTMLElement
    const tree = treeButtons()[0]
    fireEvent.pointerDown(scroller, { pointerType: 'mouse', button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(scroller, { pointerType: 'mouse', buttons: 1, clientX: 20, clientY: 40 })
    fireEvent.click(tree)
    expect(playWaterSound).not.toHaveBeenCalled()
    fireEvent.click(tree)
    expect(playWaterSound).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
