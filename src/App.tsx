import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { PullCord } from './components/PullCord'
import { About, Contact, Experience, Footer, Recognition, Skills, Work } from './components/Sections'

gsap.registerPlugin(ScrollTrigger)

type Theme = 'light' | 'dark'

const readTheme = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

export default function App() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch { /* storage may be blocked */ }
    setTheme(next)
    window.dispatchEvent(new Event('lamp-pulled'))
  }

  // Shared fade up for anything marked .reveal
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    })
    // Layout settles after fonts and images load
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      ctx.revert()
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Nav />
      <PullCord theme={theme} onPull={toggle} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Work />
        <Experience />
        <Recognition />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
