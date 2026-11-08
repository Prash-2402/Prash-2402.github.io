import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../data'
import { Icon } from './Icon'

gsap.registerPlugin(ScrollTrigger)

// Circular text that spins with scroll and links to the work section
function SpinBadge() {
  const text = 'BUILD · SECURE · AUTOMATE · SCROLL · '
  return (
    <a
      href="#work"
      aria-label="Scroll to my work"
      className="h-spin group absolute bottom-[8%] left-0 z-10 flex h-28 w-28 items-center justify-center rounded-full bg-bg/80 backdrop-blur sm:-left-6 sm:h-32 sm:w-32"
    >
      <svg viewBox="0 0 100 100" className="h-spin-ring absolute inset-0 h-full w-full">
        <defs>
          <path id="spin-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-ink font-mono text-[8.6px] tracking-[0.18em]">
          <textPath href="#spin-path">{text}</textPath>
        </text>
      </svg>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-bg transition-colors group-hover:bg-accent group-hover:text-on-accent">
        <Icon name="fa-arrow-down" className="text-sm" />
      </span>
    </a>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (!reduce) {
        // Entrance
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.from('.h-line > span', { yPercent: 110, duration: 1.1, stagger: 0.09 })
          .from('.h-fade', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, '-=0.7')
          .from('.h-arch', { scaleY: 0, transformOrigin: 'bottom', duration: 1.1 }, 0.1)
          .from('.h-outline', { scale: 0.85, opacity: 0, duration: 1.4 }, 0.3)
          .from('.h-photo', { yPercent: 35, opacity: 0, duration: 1.3 }, 0.35)
          .from('.h-spin', { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(1.6)' }, 1)

        // Scroll story: photo rises, arches separate, text drifts away
        gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
          .to('.h-photo', { yPercent: -12, scale: 1.08, ease: 'none' }, 0)
          .to('.h-arch', { scale: 1.18, yPercent: 8, ease: 'none' }, 0)
          .to('.h-outline', { scale: 1.3, yPercent: -6, opacity: 0, ease: 'none' }, 0)
          .to('.h-text', { yPercent: -18, opacity: 0.15, ease: 'none' }, 0)
          .to('.h-spin-ring', { rotate: 360, ease: 'none' }, 0)
          .to('.h-word', { xPercent: -25, ease: 'none' }, 0)
      }
    }, root)

    // When the cord is pulled, the photo reacts
    const onPull = () => {
      if (reduce) return
      gsap.timeline()
        .to('.h-photo-inner', { y: -22, rotate: -1.5, duration: 0.18, ease: 'power2.out' })
        .to('.h-photo-inner', { y: 0, rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
      gsap.fromTo('.h-flash', { opacity: 0.7 }, { opacity: 0, duration: 0.7, ease: 'power2.out' })
    }
    window.addEventListener('lamp-pulled', onPull)
    return () => {
      ctx.revert()
      window.removeEventListener('lamp-pulled', onPull)
    }
  }, [])

  return (
    <section id="top" ref={root} className="relative overflow-hidden pt-28">
      <div className="wrap grid items-end gap-10 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-12">
        {/* Text */}
        <div className="h-text relative z-10 pb-6 lg:col-span-7 lg:pb-24">
          <h1 className="font-serif text-[17vw] leading-[0.92] tracking-tight sm:text-[13vw] lg:text-[8.6rem]">
            {/* Bottom padding keeps descenders like j and g from being clipped by the reveal mask */}
            <span className="h-line block overflow-hidden pb-[0.14em]"><span className="block">Prajwal S</span></span>
            <span className="h-line -mt-[0.14em] block overflow-hidden pb-[0.16em]">
              <span className="block pr-[0.06em] italic text-accent">Hangaragi</span>
            </span>
          </h1>

          <p className="h-fade mt-4 font-mono text-xs uppercase tracking-[0.18em] text-muted sm:text-sm">
            {profile.role} · Cybersecurity · Autonomy
          </p>
          <p className="h-fade mt-4 max-w-xl text-lg leading-relaxed text-ink/80 sm:text-xl">{profile.tagline}</p>

          <div className="h-fade mt-8 flex flex-wrap items-center gap-3">
            <a href="#work" className="btn btn-solid">
              See my work <Icon name="fa-arrow-right" className="text-xs" />
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-line">
              Resume <Icon name="fa-file-arrow-down" className="text-xs" />
            </a>
            <div className="ml-1 flex items-center gap-1">
              {[
                { href: profile.github, icon: 'fa-github', label: 'GitHub' },
                { href: profile.linkedin, icon: 'fa-linkedin-in', label: 'LinkedIn' },
                { href: `mailto:${profile.email}`, icon: 'fa-envelope', label: 'Email' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink hover:text-bg"
                >
                  <Icon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative mx-auto h-[460px] w-full max-w-[400px] sm:h-[560px] lg:col-span-5 lg:h-[min(680px,calc(100svh-7rem))] lg:max-w-none">
          <div className="lamp-glow pointer-events-none absolute -top-10 left-1/2 h-[120%] w-[140%] -translate-x-1/2" />
          <div className="h-outline absolute bottom-0 left-1/2 h-[88%] w-[96%] -translate-x-1/2 rounded-t-full border border-ink/15" />
          <div className="h-arch absolute bottom-0 left-1/2 h-[78%] w-[82%] -translate-x-1/2 rounded-t-full bg-accent" />
          <div className="h-photo absolute inset-x-0 bottom-0 flex h-full justify-center">
            <div className="h-photo-inner relative h-full origin-bottom">
              <img
                src={profile.cutout}
                alt="Prajwal S Hangaragi standing in a black suit"
                className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)]"
              />
              <div className="h-flash pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgb(var(--glow)/0.9),transparent)] opacity-0 mix-blend-screen" />
            </div>
          </div>
          <SpinBadge />
        </div>
      </div>

      {/* Big drifting word */}
      <div aria-hidden="true" className="h-word outline-text pointer-events-none -mt-6 select-none whitespace-nowrap font-serif text-[22vw] leading-none lg:-mt-16">
        Build · Secure · Automate · Build · Secure
      </div>
    </section>
  )
}
