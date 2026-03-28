"use client"

import { useEffect } from "react"
import Lenis from "lenis"

const NESTED_SELECTOR = "[data-lenis-scroll='true']"

/**
 * Window Lenis + nested instances for every `[data-lenis-scroll="true"]`.
 * Nested regions are synced when the DOM changes (e.g. bill preview toggled on).
 */
export default function LenisScroll() {
  useEffect(() => {
    const nestedMap = new Map<HTMLElement, Lenis>()

    const syncNested = () => {
      const els = document.querySelectorAll<HTMLElement>(NESTED_SELECTOR)
      const next = new Set(els)

      for (const [el, lenis] of Array.from(nestedMap.entries())) {
        if (!next.has(el) || !el.isConnected) {
          lenis.destroy()
          nestedMap.delete(el)
        }
      }

      for (const el of els) {
        if (nestedMap.has(el)) continue
        const content = (el.firstElementChild as HTMLElement | null) ?? el
        const lenis = new Lenis({
          wrapper: el,
          content,
          eventsTarget: el,
          smoothWheel: true,
          lerp: 0.08,
          allowNestedScroll: true,
        })
        nestedMap.set(el, lenis)
      }
    }

    let syncRafId = 0
    const scheduleSyncNested = () => {
      if (syncRafId) return
      syncRafId = requestAnimationFrame(() => {
        syncRafId = 0
        syncNested()
      })
    }

    const windowLenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      allowNestedScroll: true,
    })

    syncNested()

    const observer = new MutationObserver(scheduleSyncNested)
    observer.observe(document.body, { childList: true, subtree: true })

    let rafId = 0
    const raf = (time: number) => {
      windowLenis.raf(time)
      nestedMap.forEach((l) => l.raf(time))
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      if (syncRafId) cancelAnimationFrame(syncRafId)
      observer.disconnect()
      windowLenis.destroy()
      nestedMap.forEach((l) => l.destroy())
      nestedMap.clear()
    }
  }, [])

  return null
}
