import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { playWaterSound } from './alert'
import { Garden } from './Garden'
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
    ['a buffalo', 'use[href="#buffalo"]', 17],
  ])('brings %s (%s) only once they have arrived', (_, selector, count) => {
    const before = show(makeTrees(count - 1))
    expect(before.container.querySelector(selector)).toBeNull()
    before.unmount()
    const after = show(makeTrees(count))
    expect(after.container.querySelector(selector)).not.toBeNull()
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

describe('reduced motion', () => {
  it('marks every moving part so one rule can stop them all', () => {
    const { container } = show(makeTrees(20))
    for (const selector of ['.fly', '.swim', '.flap', '.breathe', '.blink']) {
      for (const el of container.querySelectorAll(selector)) {
        expect(el.closest('.life')).not.toBeNull()
      }
    }
  })
})
