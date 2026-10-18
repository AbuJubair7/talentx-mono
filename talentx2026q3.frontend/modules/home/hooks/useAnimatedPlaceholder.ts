'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_ANIMATED_PLACEHOLDER_DELETING_SPEED_MILLISECONDS,
  DEFAULT_ANIMATED_PLACEHOLDER_PAUSE_DURATION_MILLISECONDS,
  DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK,
  DEFAULT_ANIMATED_PLACEHOLDER_TYPING_SPEED_MILLISECONDS,
} from '../constants/animatedSearchRoleTitles'

export interface UseAnimatedPlaceholderOptions {
  roles: readonly string[]
  isUserTyping?: boolean
  staticFallback?: string
  typingSpeedMs?: number
  deletingSpeedMs?: number
  pauseDurationMs?: number
}

function getNextNonRepeatingRoleIndex(
  currentRoleIndex: number,
  totalRolesCount: number
): number {
  if (totalRolesCount <= 1) {
    return 0
  }

  let nextRoleIndex = Math.floor(Math.random() * totalRolesCount)
  if (nextRoleIndex === currentRoleIndex) {
    nextRoleIndex = (currentRoleIndex + 1) % totalRolesCount
  }
  return nextRoleIndex
}

export function useAnimatedPlaceholder(
  options: UseAnimatedPlaceholderOptions
): string {
  const {
    roles,
    isUserTyping = false,
    staticFallback = DEFAULT_ANIMATED_PLACEHOLDER_STATIC_FALLBACK,
    typingSpeedMs = DEFAULT_ANIMATED_PLACEHOLDER_TYPING_SPEED_MILLISECONDS,
    deletingSpeedMs = DEFAULT_ANIMATED_PLACEHOLDER_DELETING_SPEED_MILLISECONDS,
    pauseDurationMs = DEFAULT_ANIMATED_PLACEHOLDER_PAUSE_DURATION_MILLISECONDS,
  } = options

  const [displayedPlaceholder, setDisplayedPlaceholder] =
    useState<string>(staticFallback)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const currentRoleIndexReference = useRef<number>(0)
  const characterCountReference = useRef<number>(0)
  const animationPhaseReference = useRef<'typing' | 'pausing' | 'deleting'>('typing')
  const hasInitializedRoleIndexReference = useRef<boolean>(false)

  // Synchronize motion preference changes dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionPreferenceChange = (mediaQueryEvent: MediaQueryListEvent) => {
      setPrefersReducedMotion(mediaQueryEvent.matches)
    }

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleMotionPreferenceChange)
    } else if (typeof mediaQueryList.addListener === 'function') {
      mediaQueryList.addListener(handleMotionPreferenceChange)
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === 'function') {
        mediaQueryList.removeEventListener('change', handleMotionPreferenceChange)
      } else if (typeof mediaQueryList.removeListener === 'function') {
        mediaQueryList.removeListener(handleMotionPreferenceChange)
      }
    }
  }, [])

  // Manage animated typing loop
  useEffect(() => {
    if (prefersReducedMotion || roles.length === 0 || isUserTyping) {
      return
    }

    if (!hasInitializedRoleIndexReference.current) {
      currentRoleIndexReference.current = Math.floor(Math.random() * roles.length)
      hasInitializedRoleIndexReference.current = true
    }

    let timeoutIdentifier: ReturnType<typeof setTimeout> | null = null

    const executeAnimationStep = () => {
      const totalRolesCount = roles.length
      if (totalRolesCount === 0) {
        return
      }

      const activeRoleIndex = currentRoleIndexReference.current % totalRolesCount
      const activeRoleTitle = roles[activeRoleIndex] ?? ''

      if (animationPhaseReference.current === 'typing') {
        if (characterCountReference.current < activeRoleTitle.length) {
          characterCountReference.current += 1
          setDisplayedPlaceholder(
            activeRoleTitle.slice(0, characterCountReference.current)
          )

          if (characterCountReference.current === activeRoleTitle.length) {
            animationPhaseReference.current = 'pausing'
            timeoutIdentifier = setTimeout(executeAnimationStep, pauseDurationMs)
          } else {
            timeoutIdentifier = setTimeout(executeAnimationStep, typingSpeedMs)
          }
        } else {
          animationPhaseReference.current = 'pausing'
          timeoutIdentifier = setTimeout(executeAnimationStep, pauseDurationMs)
        }
      } else if (animationPhaseReference.current === 'pausing') {
        animationPhaseReference.current = 'deleting'
        timeoutIdentifier = setTimeout(executeAnimationStep, deletingSpeedMs)
      } else if (animationPhaseReference.current === 'deleting') {
        if (characterCountReference.current > 0) {
          characterCountReference.current -= 1
          setDisplayedPlaceholder(
            activeRoleTitle.slice(0, characterCountReference.current)
          )
          timeoutIdentifier = setTimeout(executeAnimationStep, deletingSpeedMs)
        } else {
          currentRoleIndexReference.current = getNextNonRepeatingRoleIndex(
            activeRoleIndex,
            totalRolesCount
          )
          animationPhaseReference.current = 'typing'
          timeoutIdentifier = setTimeout(executeAnimationStep, typingSpeedMs)
        }
      }
    }

    const nextStepDelayMilliseconds =
      animationPhaseReference.current === 'pausing'
        ? pauseDurationMs
        : animationPhaseReference.current === 'deleting'
          ? deletingSpeedMs
          : typingSpeedMs

    timeoutIdentifier = setTimeout(executeAnimationStep, nextStepDelayMilliseconds)

    return () => {
      if (timeoutIdentifier !== null) {
        clearTimeout(timeoutIdentifier)
      }
    }
  }, [
    prefersReducedMotion,
    isUserTyping,
    roles,
    typingSpeedMs,
    deletingSpeedMs,
    pauseDurationMs,
  ])

  if (prefersReducedMotion || roles.length === 0) {
    return staticFallback
  }

  return displayedPlaceholder
}
