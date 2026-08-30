import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const fontsCss = readFileSync(resolve(root, 'src/styles/fonts.css'), 'utf8')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
}

describe('self-hosted fonts', () => {
  it('imports Geist and Geist Mono from @fontsource-variable — and nothing else', () => {
    expect(fontsCss).toMatch(/@fontsource-variable\/geist(?!-mono)/)
    expect(fontsCss).toMatch(/@fontsource-variable\/geist-mono/)
    expect(fontsCss.match(/@import/g)?.length).toBe(2)
  })

  it('loads no serif family (Swiss: one grotesque + one mono)', () => {
    expect(fontsCss).not.toMatch(/fraunces|serif/i)
    expect(Object.keys(pkg.dependencies).some((dep) => /serif|fraunces/i.test(dep))).toBe(false)
  })

  it('pulls no font from a third-party CDN', () => {
    expect(fontsCss).not.toMatch(/fonts\.googleapis\.com/)
    expect(fontsCss).not.toMatch(/fonts\.gstatic\.com/)
  })

  it('declares the two families as runtime dependencies', () => {
    const deps = pkg.dependencies
    expect(deps['@fontsource-variable/geist']).toBeTruthy()
    expect(deps['@fontsource-variable/geist-mono']).toBeTruthy()
    expect(deps['@fontsource-variable/fraunces']).toBeUndefined()
  })
})
