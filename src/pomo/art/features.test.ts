import { dragonfly, FEATURE_IDS, feature, fireflies, towerHeight } from './features'

it.each(FEATURE_IDS)('draws the %s with real numbers', (id) => {
  const art = feature(id, 2)
  expect(art).toContain(`data-feature="${id}"`)
  expect(art).toContain('<path')
  expect(art).not.toMatch(/NaN|undefined|Infinity/)
})

it('gives back the same markup each time, so nothing redraws', () => {
  for (const id of FEATURE_IDS) expect(feature(id, 3)).toBe(feature(id, 3))
})

it('builds a taller tower for more floors', () => {
  const lit = (floors: number) => feature('tower', floors).split('class="life sweep"').length - 1
  expect([lit(2), lit(3), lit(5)]).toEqual([2, 3, 5])
  expect(towerHeight(5)).toBeGreaterThan(towerHeight(3))
  expect(towerHeight(3)).toBeGreaterThan(towerHeight(2))
})

it('flies the Vietnam flag and sweeps two searchlights on every tower', () => {
  for (const floors of [2, 3, 5]) {
    const art = feature('tower', floors)
    expect(art).toContain('#DA251D')
    expect(art).toContain('#FFDD00')
    expect(art.split('class="life beam"')).toHaveLength(3)
  }
})

it('keeps fireflies and the lantern glow for the night', () => {
  expect(fireflies(0, 0, 1).split('class="night firefly"')).toHaveLength(6)
  expect(feature('lantern', 2)).toContain('class="night"')
})

it('draws a dragonfly with four wings', () => {
  expect(dragonfly(0, 0, 0).split('class="flap"')).toHaveLength(5)
  expect(dragonfly(1.23, 4.56, 1)).not.toMatch(/NaN/)
})
