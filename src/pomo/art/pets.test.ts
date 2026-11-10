import { buildPet, buildWalk, PET_FRAME, PET_IDS, PETS, petMarkup, WALK_PARTS } from './pets'

describe.each(PET_IDS)('%s', (id) => {
  it('has body, head, tail, and eyelid parts', () => {
    const parts = buildPet(id)
    for (const name of ['body', 'head', 'tail', 'lids'] as const) {
      expect(parts[name].size).toBeGreaterThan(0)
    }
  })

  it('has a walking pose on four legs, with the sitting head moved onto it', () => {
    const walk = buildWalk(id)
    for (const name of WALK_PARTS) expect(walk[name].size).toBeGreaterThan(0)
    const markup = petMarkup(id, 0)
    expect(markup).toMatch(/<g class="sit">.*<g class="walk">/)
    for (const name of WALK_PARTS) expect(markup).toContain(`#pet-${id}-walk-${name}`)
    expect(markup.split(`#pet-${id}-head"`)).toHaveLength(3)
    expect(markup.match(/class="life stride/g)).toHaveLength(2)
  })

  it('fits its sprite frame in both poses', () => {
    const { tu, walk } = PETS[id]
    const [dy, dz] = walk.head
    const sit = Object.values(buildPet(id)).flatMap((g) => [...g.values()])
    const head = (['earsBack', 'head', 'ears', 'tongue'] as const).flatMap((k) =>
      [...buildPet(id)[k].values()].map((c) => ({ ...c, y: c.y + dy, z: c.z + dz })),
    )
    const stepping = Object.values(buildWalk(id)).flatMap((g) => [...g.values()])
    for (const { x, y, z } of [...sit, ...head, ...stepping]) {
      expect((x - y - 1) * tu).toBeGreaterThanOrEqual(PET_FRAME.x)
      expect((x + 1 - y) * tu).toBeLessThanOrEqual(PET_FRAME.x + PET_FRAME.w)
      expect(((x + y) * tu) / 2 - (z + 1) * tu).toBeGreaterThanOrEqual(PET_FRAME.y)
      expect(((x + y + 2) * tu) / 2 - z * tu).toBeLessThanOrEqual(PET_FRAME.y + PET_FRAME.h)
    }
  })

  it('animates each part in place', () => {
    const markup = petMarkup(id, 0)
    expect(markup).toContain('breathe')
    expect(markup).toContain('blink')
  })
})

it('draws every dog and cat clearly smaller than the elephant', () => {
  const tallest = (id: (typeof PET_IDS)[number]) =>
    Math.max(...Object.values(buildPet(id)).flatMap((g) => [...g.values()].map((c) => c.z + 1))) *
    PETS[id].tu
  for (const id of ['corgi', 'golden', 'shiba', 'yellow', 'white', 'black'] as const) {
    expect(tallest(id)).toBeLessThan(tallest('elephant') * 0.8)
  }
})

it('gives only the Golden retriever a tongue', () => {
  expect(buildPet('golden').tongue.size).toBeGreaterThan(0)
  for (const id of PET_IDS) if (id !== 'golden') expect(buildPet(id).tongue.size).toBe(0)
})

it('gives each pet its own movement, and offsets them so they never move in unison', () => {
  const moves = PET_IDS.map((id, i) =>
    [...petMarkup(id, i).matchAll(/class="life ([\w-]+)"/g)]
      .map((m) => m[1])
      .sort()
      .join(),
  )
  expect(new Set(moves).size).toBe(PET_IDS.length)
  const delays = PET_IDS.map((id, i) => petMarkup(id, i).match(/animation-delay:([-\d.]+)s/)?.[1])
  expect(new Set(delays).size).toBe(PET_IDS.length)
})
