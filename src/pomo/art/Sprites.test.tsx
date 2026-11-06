import { render } from '@testing-library/react'
import { SPECIES_IDS } from '../session'
import { PET_IDS, partsOf } from './pets'
import { Sprites } from './Sprites'

it('defines every sprite the garden and Work view refer to, only once', () => {
  const gradient = { addColorStop: () => {} }
  const ctx = new Proxy(
    {},
    {
      get: (_, key) => (key === 'createRadialGradient' ? () => gradient : () => {}),
      set: () => true,
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never)
  const toDataURL = vi
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockReturnValue('data:image/png;base64,AA')

  const { container, rerender } = render(<Sprites />)
  const ids = [
    ...SPECIES_IDS.flatMap((id) => [0, 1, 2, 3].map((st) => `tree-${id}-${st}`)),
    ...[0, 1, 2, 3].map((v) => `plot-${v}`),
    ...['pond-ground', 'egret', 'rocks', 'meadow', 'buffalo', 'can'],
    ...PET_IDS.flatMap((id) => [`pet-${id}-base`, ...partsOf(id).map((k) => `pet-${id}-${k}`)]),
  ]
  for (const id of ids) expect(container.querySelector(`[id="${id}"]`)).not.toBeNull()

  const painted = toDataURL.mock.calls.length
  rerender(<Sprites />)
  expect(toDataURL.mock.calls.length).toBe(painted)
  vi.restoreAllMocks()
})
