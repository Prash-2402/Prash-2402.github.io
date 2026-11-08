import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

type Props = { theme: 'light' | 'dark'; onPull: () => void }

const MAX = 110 // how far it can be pulled
const TRIGGER = 55 // pull distance that flips the light

// Shorter cord on phones so the bulb sits beside the menu button
const restLength = () => (window.innerWidth < 640 ? 50 : 96)
let REST = typeof window === 'undefined' ? 96 : restLength()

// A hanging lamp cord. Drag it down and let go to switch the light.
export function PullCord({ theme, onPull }: Props) {
  const cordRef = useRef<SVGLineElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)
  const startY = useRef(0)
  const pulled = useRef(0)
  const dragging = useRef(false)
  const [hint, setHint] = useState(true)
  const [rest, setRest] = useState(REST)

  const setLength = (extra: number) => {
    const len = REST + extra
    cordRef.current?.setAttribute('y2', String(len))
    if (knobRef.current) knobRef.current.style.transform = `translate(-50%, ${len}px)`
  }

  useEffect(() => {
    const onResize = () => {
      REST = restLength()
      if (!dragging.current) setLength(0)
      setRest(REST)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Gentle idle sway so people notice it
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: 10, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 3, delay: 2.2,
      onUpdate: () => { if (!dragging.current) setLength(state.v) },
    })
    return () => { tween.kill() }
  }, [])

  const release = () => {
    if (!dragging.current) return
    dragging.current = false
    const fired = pulled.current > TRIGGER
    const state = { v: pulled.current }
    gsap.to(state, { v: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)', onUpdate: () => setLength(state.v) })
    if (fired) {
      setHint(false)
      onPull()
    }
    pulled.current = 0
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    startY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    pulled.current = Math.max(0, Math.min(MAX, e.clientY - startY.current))
    setLength(pulled.current)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    dragging.current = true
    pulled.current = MAX
    setLength(MAX)
    setTimeout(release, 120)
  }

  return (
    <div className="pointer-events-none fixed right-5 top-0 z-[60] h-[240px] w-12 sm:right-8 lg:right-12">
      <svg className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible" width="2" height="240">
        <line ref={cordRef} x1="1" y1="0" x2="1" y2={REST} stroke="rgb(var(--ink))" strokeOpacity="0.55" strokeWidth="1.5" />
      </svg>
      <button
        ref={knobRef}
        type="button"
        aria-label={theme === 'light' ? 'Pull the cord to turn the lights off' : 'Pull the cord to turn the lights on'}
        aria-pressed={theme === 'dark'}
        className="pointer-events-auto absolute left-1/2 top-0 flex touch-none cursor-grab select-none flex-col items-center outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent rounded-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKey}
      >
        <span className="bulb block h-5 w-5 rounded-full border border-ink/30" />
        <span className="mt-0.5 block h-3 w-1.5 rounded-b bg-ink/60" />
      </button>
      {hint && (
        <span
          className="absolute right-8 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
          style={{ top: rest + 26 }}
        >
          Pull me
          <i className="fas fa-arrow-down ml-1.5 animate-bounce" />
        </span>
      )}
    </div>
  )
}
