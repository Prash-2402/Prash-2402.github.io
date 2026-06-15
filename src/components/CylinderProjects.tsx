import React, { useEffect, useRef } from 'react';

interface Project {
  title: string;
  subtitle: string;
  tags: string[];
  desc: string;
  link?: string;
}

interface CylinderProjectsProps {
  projects: Project[];
}

// easeInOutQuad — smooth scroll-progress interpolation
const ease = (p: number): number =>
  p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

export const CylinderProjects: React.FC<CylinderProjectsProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // slotRefs: used for stable getBoundingClientRect (layout unaffected by 3D transforms)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  // cardRefs: the actual elements we animate
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slots.length === 0 || cards.length === 0) return;

    const isMobile = () => window.innerWidth < 640;

    const updateCards = () => {
      const vh = window.innerHeight;
      const mobile = isMobile();

      // Mobile: less extreme depth + tighter horizontal offset to avoid screen clipping
      const finalXAbs = mobile ? 40 : 140;
      const startTranslateZ = mobile ? -250 : -500;

      slots.forEach((slot, idx) => {
        const card = cards[idx];
        if (!card) return;

        // ── Progress calculation ─────────────────────────────────────────────
        // Uses the SLOT's rect (not the card's) so 3D transforms on the card
        // don't corrupt the measurement — slots are in normal document flow.
        const slotRect = slot.getBoundingClientRect();
        const denominator = vh * 0.9 - slotRect.height / 2;

        // p = 0 when slot bottom just enters viewport bottom
        // p = 1 when slot has scrolled up enough to sit near center
        const rawP = denominator > 0 ? (vh - slotRect.top) / denominator : 1;
        const p = Math.max(0, Math.min(1, rawP));
        const eased = ease(p);

        // ── Property interpolation ───────────────────────────────────────────
        // START (p=0): facing away, deep behind the line, centered, tiny
        // END   (p=1): facing viewer, at z=0, offset left/right, full size

        // Alternate: even idx → left (negative X), odd idx → right (positive X)
        const finalX = idx % 2 === 0 ? -finalXAbs : finalXAbs;

        const rotateY    = 180 * (1 - eased);                             // 180 → 0
        const translateZ = startTranslateZ + (0 - startTranslateZ) * eased; // startZ → 0
        const translateX = finalX * eased;                                 // 0 → finalX
        const scale      = 0.25 + 0.75 * eased;                           // 0.25 → 1
        const opacity    = eased;                                          // 0 → 1

        // ── Apply — transform order matters for correct 3D compositing ───────
        // translateX/Z happen in world space (before rotation),
        // then rotateY, then scale.
        card.style.transform =
          `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
      });

      ticking.current = false;
    };

    // One passive scroll listener — shares the same rAF loop as GSAP's
    // ScrollTrigger (which also runs passively on scroll); no conflicts.
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current = requestAnimationFrame(updateCards);
      }
    };

    // Kick off an initial render so cards are in the correct start state
    // before any user scrolling occurs.
    updateCards();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCards, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateCards);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [projects.length]);

  return (
    /*
     * perspective sits on the outer wrapper — NOT on individual cards.
     * overflow must stay visible; translateZ breaks out of clipping rects.
     */
    <div
      ref={containerRef}
      className="cylinder-projects-wrapper"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
    >
      {projects.map((proj, idx) => (
        /*
         * The SLOT is in normal document flow — its getBoundingClientRect()
         * is the stable input for the scroll-progress formula AND for the
         * SVG scroll-path coordinate system. We must not transform the slot.
         */
        <div
          key={idx}
          ref={(el) => { slotRefs.current[idx] = el; }}
          className="cylinder-slot"
          style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            // Slots must not clip their children's 3D transforms
            overflow: 'visible',
          }}
        >
          {/*
           * The CARD is the 3D-animated element.
           * backface-visibility: hidden hides the card when its back faces
           * the camera (rotateY ≈ 180°), preventing mirrored content bleed-through.
           * No CSS transition on transform — values are set every rAF frame.
           */}
          <div
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="glass-panel cylinder-card"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '100%',
              maxWidth: '680px',
              transformOrigin: 'center center',
            }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-white select-none">
              {proj.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-3">
              {proj.subtitle}
            </p>

            <div className="project-tags flex flex-wrap gap-2 mb-4">
              {proj.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="tag bg-[#00ff9c]/10 text-[#00ff9c] border border-[#00ff9c]/20 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
              {proj.desc}
            </p>

            {proj.link && (
              <a
                href={proj.link}
                target="_blank"
                rel="noreferrer"
                className="project-link inline-flex items-center text-[#00ff9c] hover:underline text-sm font-semibold"
              >
                Live Demo
                <i className="fas fa-external-link-alt ml-1.5 text-xs"></i>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
