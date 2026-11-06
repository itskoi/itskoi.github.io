import { buildPet, PET_IDS, petMarkup } from './pets'

describe.each(PET_IDS)('%s', (id) => {
  it('has body, head, tail, and eyelid parts', () => {
    const parts = buildPet(id)
    for (const name of ['body', 'head', 'tail', 'lids'] as const) {
      expect(parts[name].size).toBeGreaterThan(0)
    }
  })

  it('animates each part in place', () => {
    const markup = petMarkup(id, 0)
    expect(markup).toContain('breathe')
    expect(markup).toContain('blink')
  })
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
