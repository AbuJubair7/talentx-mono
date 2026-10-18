import { act, renderHook } from '@testing-library/react'
import {
  ANIMATED_SEARCH_ROLE_TITLES,
  DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK,
} from '../constants/animatedSearchRoleTitles'
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder'

describe('useAnimatedPlaceholder', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    jest.useFakeTimers()
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
    window.matchMedia = originalMatchMedia
  })

  it('returns default fallback initially when staticFallback is not provided', () => {
    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: ['Senior Machine Learning Engineer'],
      })
    )

    expect(result.current).toBe(DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK)
  })

  it('returns custom static fallback initially when provided', () => {
    const customFallback = 'Search by position or technology...'
    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: ['Full-Stack AI Application Developer'],
        staticFallback: customFallback,
      })
    )

    expect(result.current).toBe(customFallback)
  })

  it('types characters over time and progresses through pause and delete cycles', () => {
    const singleRole = ['AI Lead'] as const
    const typingSpeedMilliseconds = 50
    const deletingSpeedMilliseconds = 30
    const pauseDurationMilliseconds = 1000

    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: singleRole,
        typingSpeedMs: typingSpeedMilliseconds,
        deletingSpeedMs: deletingSpeedMilliseconds,
        pauseDurationMs: pauseDurationMilliseconds,
      })
    )

    // Initial state before timer progression
    expect(result.current).toBe(DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK)

    // Step 1: Types 'A'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('A')

    // Step 2: Types 'AI'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI')

    // Step 3: Types 'AI '
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI ')

    // Step 4: Types 'AI L'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI L')

    // Step 5: Types 'AI Le'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI Le')

    // Step 6: Types 'AI Lea'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI Lea')

    // Step 7: Types 'AI Lead' (Full word reached, switches to pause phase)
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI Lead')

    // During pause duration, placeholder remains full
    act(() => {
      jest.advanceTimersByTime(pauseDurationMilliseconds / 2)
    })
    expect(result.current).toBe('AI Lead')

    act(() => {
      jest.advanceTimersByTime(pauseDurationMilliseconds / 2)
    })
    expect(result.current).toBe('AI Lead')

    // Deleting phase begins: character count decrements
    act(() => {
      jest.advanceTimersByTime(deletingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI Lea')

    act(() => {
      jest.advanceTimersByTime(deletingSpeedMilliseconds)
    })
    expect(result.current).toBe('AI Le')

    // Delete remaining characters to empty
    act(() => {
      jest.advanceTimersByTime(deletingSpeedMilliseconds * 5)
    })
    expect(result.current).toBe('')
  })

  it('pauses animation timer when isUserTyping is true and resumes when false', () => {
    const typingSpeedMilliseconds = 50

    const { result, rerender } = renderHook(
      ({ isUserTyping }) =>
        useAnimatedPlaceholder({
          roles: ['Staff Data Infrastructure Architect'],
          isUserTyping,
          typingSpeedMs: typingSpeedMilliseconds,
        }),
      {
        initialProps: { isUserTyping: false },
      }
    )

    // Advance 3 typing steps: 'Sta'
    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds * 3)
    })
    expect(result.current).toBe('Sta')

    // User starts typing: animation must pause
    rerender({ isUserTyping: true })

    // Advance time significantly while user is typing
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    // Placeholder must remain unchanged
    expect(result.current).toBe('Sta')

    // User stops typing: animation must resume
    rerender({ isUserTyping: false })

    act(() => {
      jest.advanceTimersByTime(typingSpeedMilliseconds)
    })
    expect(result.current).toBe('Staf')
  })

  it('respects prefers-reduced-motion by maintaining static fallback without animating', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const reducedMotionFallback = 'Static Search Placeholder'
    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: ['LLM Research Scientist'],
        staticFallback: reducedMotionFallback,
        typingSpeedMs: 50,
      })
    )

    expect(result.current).toBe(reducedMotionFallback)

    // Advance timers significantly
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Must still be the static fallback
    expect(result.current).toBe(reducedMotionFallback)
  })

  it('cleans up timers on unmount without throwing errors', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

    const { unmount } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: ['Computer Vision Engineer'],
        typingSpeedMs: 50,
      })
    )

    expect(() => {
      unmount()
    }).not.toThrow()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('handles empty roles gracefully by returning static fallback', () => {
    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: [],
        staticFallback: 'No roles available',
      })
    )

    expect(result.current).toBe('No roles available')

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current).toBe('No roles available')
  })

  it('works correctly with the 10 ANIMATED_SEARCH_ROLE_TITLES industry constants', () => {
    expect(ANIMATED_SEARCH_ROLE_TITLES).toHaveLength(10)
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Machine Learning Engineer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('AI Research Scientist')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('LLM Engineer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Computer Vision Engineer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Data Scientist')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Data Analyst')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Analytics Engineer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Backend Engineer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('Full Stack Developer')
    expect(ANIMATED_SEARCH_ROLE_TITLES).toContain('DevOps Engineer')

    const { result } = renderHook(() =>
      useAnimatedPlaceholder({
        roles: ANIMATED_SEARCH_ROLE_TITLES,
        typingSpeedMs: 40,
      })
    )

    expect(result.current).toBe(DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK)

    act(() => {
      jest.advanceTimersByTime(40)
    })

    expect(result.current.length).toBe(1)
  })
})
