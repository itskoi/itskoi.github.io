import { useEffect, useState } from 'react'
import type { Theme } from '@/lib/theme'
import { getTheme, onThemeChange, toggleTheme } from '@/lib/theme'

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(getTheme)
  useEffect(() => onThemeChange(setTheme), [])
  return { theme, toggle: toggleTheme }
}
