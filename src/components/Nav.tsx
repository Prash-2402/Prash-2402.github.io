import { useEffect, useState } from 'react'
import { profile } from '../data'
import { Icon } from './Icon'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach(l => {
      const el = document.getElementById(l.id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="wrap flex h-16 items-center justify-between pr-16 sm:pr-20 lg:pr-24">
        <a href="#top" className="font-serif text-2xl tracking-tight" aria-label="Back to top">
          Prajwal<span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map(l => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`text-sm font-medium transition-colors hover:text-ink ${active === l.id ? 'text-ink' : 'text-muted'}`}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-solid !px-4 !py-2">
              Resume <Icon name="fa-arrow-down" className="text-[10px]" />
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <Icon name={open ? 'fa-xmark' : 'fa-bars'} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <ul className="wrap flex flex-col py-4">
            {LINKS.map(l => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block py-3 font-serif text-3xl">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-solid">
                Download resume
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
