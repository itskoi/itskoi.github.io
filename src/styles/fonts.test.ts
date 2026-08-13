import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const fontsCss = readFileSync(resolve(root, 'src/styles/fonts.css'), 'utf8')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
}

describe('self-hosted fonts', () => {
  it('imports Fraunces, Geist, and Geist Mono from @fontsource-variable', () => {
    expect(fontsCss).toMatch(/@fontsource-variable\/fraunces/)
    // Geist, but not Geist Mono (negative lookahead so this line doesn't match the mono import).
    expect(fontsCss).toMatch(/@fontsource-variable\/geist(?!-mono)/)
    expect(fontsCss).toMatch(/@fontsource-variable\/geist-mono/)
  })

  it('pulls no font from a third-party CDN', () => {
    expect(fontsCss).not.toMatch(/fonts\.googleapis\.com/)
    expect(fontsCss).not.toMatch(/fonts\.gstatic\.com/)
  })

  it('declares the three families as runtime dependencies', () => {
    const deps = pkg.dependencies
    expect(deps['@fontsource-variable/fraunces']).toBeTruthy()
    expect(deps['@fontsource-variable/geist']).toBeTruthy()
    expect(deps['@fontsource-variable/geist-mono']).toBeTruthy()
  })
})
