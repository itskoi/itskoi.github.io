import '@testing-library/jest-dom/vitest'

// jsdom does not implement matchMedia. Provide a minimal stub (default: motion allowed);
// individual tests override with vi.stubGlobal to simulate prefers-reduced-motion.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
