"use client"

import { useEffect } from "react"
import Lenis from "lenis"

export default function LenisScroll() {
  useEffect(() => {
    const windowLenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      allowNestedScroll: true,
    })

    const nestedEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lenis-scroll='true']")
    )
    const nestedLenis = nestedEls.map((el) => {
      const content = (el.firstElementChild as HTMLElement | null) ?? el
      return new Lenis({
        wrapper: el,
        content,
        eventsTarget: el,
        smoothWheel: true,
        lerp: 0.08,
      })
    })

    const raf = (time: number) => {
      windowLenis.raf(time)
      nestedLenis.forEach((l) => l.raf(time))
      requestAnimationFrame(raf)
    }

    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      windowLenis.destroy()
      nestedLenis.forEach((l) => l.destroy())
    }
  }, [])

  return null
}

