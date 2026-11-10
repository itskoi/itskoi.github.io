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
    expect(screen.queryAllByRole('button')).toEqual([])
    expect(screen.getByRole('img', { name: 'Phượng mature' })).toBeInTheDocument()
    expect(container.querySelector('[tabindex]')).toBeNull()
    fireEvent.click(screen.getByRole('img', { name: 'Phượng mature' }))
    expect(container.querySelector('.can')).toBeNull()
    expect(playWaterSound).not.toHaveBeenCalled()
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

  it.each(['phuong', 'mai', 'dao', 'banglang', 'bang'] as const)('sheds from a mature %s', (id) => {
    expect(show(one(id, 3)).container.querySelector('.t .petal')).not.toBeNull()
  })

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
