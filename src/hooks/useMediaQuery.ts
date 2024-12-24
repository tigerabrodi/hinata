import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [isMatching, setIsMatching] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    setIsMatching(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMatching(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return isMatching
}

export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const
