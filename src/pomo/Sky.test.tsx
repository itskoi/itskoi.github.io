import { render } from '@testing-library/react'
import { Sky } from './Sky'

describe('Sky', () => {
  it('draws a sun for the day and a smaller crescent moon for the night', () => {
    const { container } = render(<Sky />)
    const pixels = (cls: string) =>
      container.querySelector(`.sun .${cls}`)?.getAttribute('d')?.split('M').length ?? 0
    expect(pixels('day')).toBeGreaterThan(80)
    expect(pixels('night')).toBeGreaterThan(20)
    expect(pixels('night')).toBeLessThan(pixels('day'))
  })

  it('drifts four clouds that reduced motion can stop, each starting where it rests', () => {
    const { container } = render(<Sky />)
    const clouds = [...container.querySelectorAll<HTMLElement>('.life.cloud')]
    expect(clouds).toHaveLength(4)
    for (const cloud of clouds) {
      const get = (name: string) => Number.parseFloat(cloud.style.getPropertyValue(name))
      // The share of the crossing already done brings the cloud back to no shift at all.
      expect(-40 - get('--x') + (-get('--t') / get('--d')) * 140).toBeCloseTo(0)
    }
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<Sky />)
    const layers = [...container.children]
    expect(layers).toHaveLength(2)
    for (const layer of layers) expect(layer).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps the sun behind the garden and the clouds in front of it', () => {
    const { container } = render(<Sky />)
    expect(container.querySelector('.sky:not(.front) .sun')).toBeInTheDocument()
    expect(container.querySelectorAll('.sky.front .cloud')).toHaveLength(4)
    expect(container.querySelector('.sky:not(.front) .cloud')).toBeNull()
  })
})
