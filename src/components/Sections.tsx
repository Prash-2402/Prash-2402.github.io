import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  about, achievements, certifications, experience, profile, projects, skillGroups,
  type Project,
} from '../data'
import { ExtLink, Icon } from './Icon'
import { ProjectModal } from './ProjectModal'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Heading({ index, eyebrow, title, accent }: { index: string; eyebrow: string; title: string; accent?: string }) {
  return (
    <div className="reveal mb-12 flex flex-col gap-4 sm:mb-16">
      <p className="eyebrow">
        <span className="text-accent">{index}</span> / {eyebrow}
      </p>
      <h2 className="section-title">
        {title} {accent && <em className="text-accent">{accent}</em>}
      </h2>
    </div>
  )
}

/* ---------- About ---------- */
export function About() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reduceMotion()) return
    const ctx = gsap.context(() => {
      // Words light up one by one as you scroll
      gsap.fromTo('.a-word', { opacity: 0.15 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: '.a-statement', start: 'top 80%', end: 'bottom 45%', scrub: true },
      })
      // Count up stats
      gsap.utils.toArray<HTMLElement>('.a-count').forEach(el => {
        const target = Number(el.dataset.n)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)) },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={ref} className="wrap py-24 sm:py-32">
      <Heading index="01" eyebrow="About" title="A builder at the meeting point of" accent="AI and security." />
      <div className="grid gap-12 lg:grid-cols-12">
        <p className="a-statement font-serif text-3xl leading-[1.2] sm:text-4xl lg:col-span-8 lg:text-[2.75rem]">
          {about.statement.split(' ').map((w, i) => (
            <span key={i} className="a-word">{w} </span>
          ))}
        </p>
        <dl className="reveal space-y-5 self-end lg:col-span-4">
          {about.facts.map(f => (
            <div key={f.k} className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <dt className="eyebrow">{f.k}</dt>
              <dd className="text-right font-semibold">
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noreferrer" className="hover:text-accent">{f.v}</a>
                ) : f.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
        {about.stats.map(s => (
          <div key={s.label} className="reveal bg-bg p-6 sm:p-8">
            <p className="font-serif text-6xl sm:text-7xl">
              <span className="a-count" data-n={s.n}>{s.n}</span>
              <span className="text-accent">+</span>
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Skills ---------- */
export function Skills() {
  const all = skillGroups.flatMap(g => g.skills)
  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="wrap">
        <Heading index="02" eyebrow="Skills" title="Tools I reach" accent="for." />
      </div>
      <div className="mb-16 overflow-hidden border-y border-line py-5" aria-hidden="true">
        <div className="marquee flex w-max gap-10 whitespace-nowrap font-serif text-4xl italic sm:text-5xl">
          {[...all, ...all].map((s, i) => (
            <span key={i} className="flex items-center gap-10">
              {s} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="wrap grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map(g => (
          <div key={g.title} className="reveal card group p-7 hover:border-ink/30">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">{g.title}</h3>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-500 group-hover:rotate-12">
                <Icon name={g.icon} />
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.skills.map(s => <span key={s} className="chip">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Work ---------- */
function ProjectCard({ p, i, onOpen }: { p: Project; i: number; onOpen: () => void }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1 hover:border-ink/30">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open details for ${p.title}`}
        className="relative block aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface text-left"
      >
        {p.image ? (
          <img
            src={p.image}
            alt={`${p.title} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-5xl text-muted">{p.title}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
          <span className="rounded-full bg-bg px-4 py-2 text-sm font-semibold text-ink">
            View details <Icon name="fa-arrow-right" className="ml-1 text-xs" />
          </span>
        </span>
        {p.note && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold text-bg backdrop-blur">
            <Icon name="fa-lock" className="text-[9px]" /> Private
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-4xl leading-none">
            <button type="button" onClick={onOpen} className="text-left hover:text-accent">{p.title}</button>
          </h3>
          <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-accent">{p.kicker}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink/75">{p.desc}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {p.tags.slice(0, 5).map(t => <span key={t} className="chip !text-[11px]">{t}</span>)}
          {p.tags.length > 5 && <span className="chip !text-[11px]">+{p.tags.length - 5}</span>}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
          <button type="button" onClick={onOpen} className="link-arrow">
            <Icon name="fa-expand" className="text-xs" /> Details
          </button>
          {p.links.map(l => <ExtLink key={l.href} {...l} />)}
        </div>
      </div>
    </article>
  )
}

export function Work() {
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Project | null>(null)
  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    if (reduceMotion()) return
    const mm = gsap.matchMedia()
    // Desktop: pinned horizontal scroll through the project cards
    mm.add('(min-width: 1024px)', () => {
      const el = track.current!
      const distance = () => el.scrollWidth - window.innerWidth
      gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current, start: 'top top', end: () => `+=${distance()}`,
          pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        },
      })
      gsap.to('.w-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: pin.current, start: 'top top', end: () => `+=${distance()}`, scrub: true },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="work" className="pt-24 sm:pt-32">
      <div ref={pin} className="relative lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="wrap">
          <div className="reveal mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow"><span className="text-accent">03</span> / Selected work</p>
              <h2 className="section-title mt-4">Things I have <em className="text-accent">built.</em></h2>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <p className="eyebrow">Scroll to explore</p>
              <div className="h-px w-40 bg-line">
                <div className="w-progress h-px origin-left scale-x-0 bg-accent" />
              </div>
            </div>
          </div>
        </div>
        <div
          ref={track}
          className="wrap grid gap-5 sm:grid-cols-2 lg:mx-0 lg:flex lg:w-max lg:max-w-none lg:gap-6 lg:pl-[max(2.5rem,calc((100vw-1200px)/2+2.5rem))] lg:pr-24"
        >
          {projects.map((p, i) => (
            <div key={p.title} className="reveal lg:w-[380px] lg:shrink-0">
              <ProjectCard p={p} i={i} onOpen={() => setOpen(p)} />
            </div>
          ))}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="reveal card group flex min-h-[260px] flex-col items-center justify-center gap-4 p-7 text-center hover:border-accent lg:w-[300px] lg:shrink-0"
          >
            <Icon name="fa-github" className="text-4xl transition-transform group-hover:scale-110" />
            <span className="font-serif text-3xl">More on GitHub</span>
            <span className="link-arrow">github.com/Prash-2402</span>
          </a>
        </div>
      </div>
      <ProjectModal project={open} onClose={close} />
    </section>
  )
}

/* ---------- Experience ---------- */
export function Experience() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reduceMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.x-line', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.x-list', start: 'top 70%', end: 'bottom 70%', scrub: true },
      })
      gsap.utils.toArray<HTMLElement>('.x-dot').forEach(d => {
        gsap.fromTo(d, { scale: 0 }, { scale: 1, ease: 'back.out(3)', duration: 0.5, scrollTrigger: { trigger: d, start: 'top 70%' } })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" ref={ref} className="wrap py-24 sm:py-32">
      <Heading index="04" eyebrow="Experience" title="Where I have" accent="worked." />
      <ol className="x-list relative">
        <div className="absolute bottom-0 left-[7px] top-2 w-px bg-line sm:left-[calc(25%+7px)]">
          <div className="x-line h-full w-px origin-top bg-accent" />
        </div>
        {experience.map(x => (
          <li key={x.org + x.role} className="relative grid gap-3 pb-14 pl-10 sm:grid-cols-4 sm:gap-10 sm:pl-0">
            <div className="sm:pr-10 sm:text-right">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{x.when}</p>
              <p className="mt-1 text-sm text-muted">{x.where}</p>
            </div>
            <span className="x-dot absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] border-bg bg-accent sm:left-[25%]" />
            <div className="reveal sm:col-span-3 sm:pl-10">
              <h3 className="font-serif text-3xl leading-tight sm:text-4xl">{x.role}</h3>
              <p className="mt-1 font-semibold text-accent">{x.org}</p>
              <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink/80">
                {x.points.map(pt => (
                  <li key={pt} className="flex gap-3">
                    <span className="mt-2.5 h-1 w-3 shrink-0 bg-ink/30" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {x.links.map(l => <ExtLink key={l.href + l.label} {...l} />)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Recognition ---------- */
export function Recognition() {
  return (
    <section id="recognition" className="wrap py-24 sm:py-32">
      <Heading index="05" eyebrow="Recognition" title="Wins and" accent="credentials." />
      <div className="grid gap-5 md:grid-cols-2">
        {achievements.map(a => (
          <a
            key={a.event}
            href={a.href}
            target="_blank"
            rel="noreferrer"
            className="reveal card group relative overflow-hidden p-8 hover:border-accent"
          >
            <div className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100" />
            <div className="relative transition-colors duration-300 group-hover:text-on-accent">
              <p className="font-serif text-5xl leading-none sm:text-6xl">{a.result}</p>
              <p className="mt-4 text-lg font-bold">{a.event}</p>
              <p className="mt-2 text-[15px] leading-relaxed opacity-75">{a.detail}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                {a.cta} <Icon name="fa-arrow-right" className="text-xs transition-transform group-hover:translate-x-1" />
              </p>
            </div>
          </a>
        ))}
      </div>

      <h3 className="reveal mb-6 mt-20 eyebrow">Certifications</h3>
      <ul className="border-t border-line">
        {certifications.map(c => (
          <li key={c.name} className="reveal">
            <a
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-6 transition-colors hover:bg-surface sm:grid-cols-[1fr_200px_120px_auto] sm:px-4"
            >
              <span className="font-serif text-2xl sm:text-3xl">{c.name}</span>
              <span className="hidden text-sm text-muted sm:block">{c.issuer}</span>
              <span className="hidden font-mono text-xs text-muted sm:block">{c.date}</span>
              <span className="flex items-center gap-2 text-sm font-semibold group-hover:text-accent">
                <span className="hidden sm:inline">Credential</span>
                <Icon name="fa-arrow-up-right-from-square" className="text-xs" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Contact ---------- */
export function Contact() {
  const items = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: 'fa-envelope' },
    { label: 'LinkedIn', value: 'prajwal-s-hangaragi1', href: profile.linkedin, icon: 'fa-linkedin' },
  ]
  return (
    <section id="contact" className="border-t border-line bg-surface py-24 transition-colors duration-500 sm:py-32">
      <div className="wrap">
        <p className="reveal eyebrow"><span className="text-accent">06</span> / Contact</p>
        <h2 className="reveal mt-6 font-serif text-[15vw] leading-[0.9] tracking-tight sm:text-[11vw] lg:text-[9rem]">
          Let&apos;s build <em className="text-accent">something.</em>
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg text-ink/75">
          Open to internships, research collaborations and hackathon teams. Email or LinkedIn is the fastest way to reach me.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {items.map(it => (
            <a
              key={it.label}
              href={it.href}
              target={it.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="reveal group bg-surface p-8 transition-colors hover:bg-bg"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">{it.label}</span>
                <Icon name={it.icon} className="text-muted transition-colors group-hover:text-accent" />
              </div>
              <p className="mt-4 break-all font-serif text-2xl sm:text-3xl">{it.value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface transition-colors duration-500">
      <div className="wrap flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Designed and built by me. Pull the cord for a surprise.</p>
        <a href="#top" className="link-arrow">Back to top <Icon name="fa-arrow-up" className="text-xs" /></a>
      </div>
    </footer>
  )
}
