import { beforeEach, describe, expect, it, vi } from 'vitest'

const themeMock = vi.hoisted(() => ({ initTheme: vi.fn() }))
vi.mock('@/lib/theme', () => ({ initTheme: themeMock.initTheme }))

const reactDomMock = vi.hoisted(() => {
  const render = vi.fn()
  return { createRoot: vi.fn(() => ({ render })), render }
})
vi.mock('react-dom/client', () => ({ createRoot: reactDomMock.createRoot }))

vi.mock('@/App', () => ({ App: () => null }))
vi.mock('lenis/dist/lenis.css', () => ({}))
vi.mock('@/styles/fonts.css', () => ({}))
vi.mock('@/styles/global.css', () => ({}))

describe('entry bootstrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    themeMock.initTheme.mockClear()
    reactDomMock.createRoot.mockClear()
    vi.resetModules()
  })

  it('initializes the theme before rendering the app', async () => {
    await import('./main')
    expect(themeMock.initTheme).toHaveBeenCalledTimes(1)
    expect(reactDomMock.createRoot).toHaveBeenCalledTimes(1)
    expect(themeMock.initTheme.mock.invocationCallOrder[0]).toBeLessThan(
      reactDomMock.createRoot.mock.invocationCallOrder[0],
    )
  })
})
