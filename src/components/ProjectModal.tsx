import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { Project } from '../data'
import { Icon } from './Icon'

type Props = { project: Project | null; onClose: () => void }

// Full detail view for a project with a large screenshot
export function ProjectModal({ project, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!project) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(panel.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [project, onClose])

  if (!project) return null
  const p = project

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
    >
      <div
        ref={panel}
        onClick={e => e.stopPropagation()}
        className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bg sm:rounded-3xl"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-accent hover:text-on-accent"
        >
          <Icon name="fa-xmark" />
        </button>

        {p.image && (
          <div className="border-b border-line bg-surface p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-1.5 border-b border-line bg-bg px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                <span className="ml-3 truncate font-mono text-[11px] text-muted">
                  {p.links.find(l => l.label === 'Live demo')?.href.replace(/^https?:\/\//, '') ?? p.note ?? 'github.com/Prash-2402'}
                </span>
              </div>
              <img src={p.image} alt={`${p.title} screenshot`} className="block w-full" />
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10">
          {p.note && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-semibold">
              <Icon name="fa-lock" className="text-[10px]" /> {p.note}
            </span>
          )}
          <h3 id="pm-title" className="font-serif text-5xl leading-none sm:text-6xl">{p.title}</h3>
          <p className="mt-2 font-semibold text-accent">{p.kicker}</p>
          <p className="mt-5 text-lg leading-relaxed text-ink/80">{p.desc}</p>

          {p.points && (
            <ul className="mt-6 space-y-2">
              {p.points.map((pt, i) => (
                <li key={pt} className="flex gap-4 border-b border-line pb-2 text-[15px] leading-relaxed text-ink/85">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {pt}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-1.5">
            {p.tags.map(t => <span key={t} className="chip">{t}</span>)}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.map(l => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={`btn ${l.label === 'Live demo' ? 'btn-solid' : 'btn-line'}`}
              >
                <Icon name={l.icon ?? 'fa-arrow-up-right-from-square'} className="text-xs" />
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
