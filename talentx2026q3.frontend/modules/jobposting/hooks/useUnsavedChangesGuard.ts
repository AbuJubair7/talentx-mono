"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type PendingNavigation = { type: "href"; href: string } | { type: "back" }

function pushTrapEntry() {
  // No URL argument: Next's patched pushState copies its own history state (__NA +
  // tree) into this entry, so popping it is a same-page soft traverse, not a reload.
  window.history.pushState({ __txUnsavedGuard: true }, "")
}

// App Router has no navigation-blocking API, so this guards each way out separately:
// - in-app <a> clicks: intercepted in the capture phase, before next/link navigates
// - browser Back: a duplicate "trap" history entry for this page absorbs the pop
//   (pushing it also clears forward history, so Forward is disabled while dirty)
// - refresh/close: beforeunload, where browsers only allow their native prompt
// `shouldAsk` turns on the in-app prompt; `warnOnUnload` (default: same) the native one, which can only say
// "leave?" — so it is kept for truly unsaved changes, not for questions like "keep the draft?".
export function useUnsavedChangesGuard(shouldAsk: boolean, options?: { warnOnUnload?: boolean }) {
  const isDirty = shouldAsk
  const warnOnUnload = options?.warnOnUnload ?? shouldAsk
  const router = useRouter()
  const [pending, setPending] = useState<PendingNavigation | null>(null)
  const isDirtyRef = useRef(isDirty)
  const trapActiveRef = useRef(false)
  const leavingRef = useRef(false)

  useEffect(() => {
    isDirtyRef.current = isDirty
    if (isDirty && !trapActiveRef.current) {
      pushTrapEntry()
      trapActiveRef.current = true
    }
  }, [isDirty])

  useEffect(() => {
    function handlePopState() {
      if (leavingRef.current || !trapActiveRef.current) return
      trapActiveRef.current = false

      if (isDirtyRef.current) {
        pushTrapEntry()
        trapActiveRef.current = true
        setPending({ type: "back" })
      } else {
        // Trap left over from before a successful save: finish the Back press.
        window.history.back()
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    if (!warnOnUnload) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (leavingRef.current) return
      event.preventDefault()
      // Must be non-empty: legacy browser semantics treat "" as "don't prompt".
      event.returnValue = "unsaved"
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [warnOnUnload])

  useEffect(() => {
    if (!isDirty) return

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as Element | null
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      event.preventDefault()
      event.stopPropagation()
      setPending({ type: "href", href: url.pathname + url.search + url.hash })
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [isDirty])

  const confirmLeave = useCallback(() => {
    if (pending === null) return
    leavingRef.current = true
    setPending(null)

    if (pending.type === "back") {
      // Skip both the trap entry and this page's own entry.
      window.history.go(-2)
      return
    }

    // Replacing the trap entry avoids leaving a dead duplicate of this page in history.
    if (trapActiveRef.current) {
      router.replace(pending.href)
    } else {
      router.push(pending.href)
    }
  }, [pending, router])

  const cancelLeave = useCallback(() => setPending(null), [])

  return { isPrompting: pending !== null, confirmLeave, cancelLeave }
}
