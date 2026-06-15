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

// easeInOutQuad
const ease = (x: number): number =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

export const CylinderProjects: React.FC<CylinderProjectsProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // slotRefs: stable layout elements — getBoundingClientRect() here is unaffected
  // by any transform applied to the inner card.
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  // cardRefs: the actual 3D-animated elements
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
      const finalXAbs = mobile ? 50 : 140;  // horizontal resting offset
      const arcY      = mobile ? 10 : 20;   // arc height during phase-2 slide

      slots.forEach((slot, idx) => {
        const card = cards[idx];
        if (!card) return;

        // ── Even index = right-resting, odd index = left-resting ────────────
        const isRight = idx % 2 === 0;

        // START rotateY: right cards hinge left edge, swing from back (+180°)
        //               left  cards hinge right edge, swing from back (-180°)
        const startRotateY = isRight ? 180 : -180;
        const finalX        = isRight ? finalXAbs : -finalXAbs;

        // ── Overall scroll progress p ∈ [0, 1] ──────────────────────────────
        // Uses the SLOT rect so card transforms don't corrupt the measurement.
        const slotRect = slot.getBoundingClientRect();
        const rawP = (vh * 0.85 - slotRect.top) / (vh * 0.65);
        const p = Math.max(0, Math.min(1, rawP));

        // ── Split into two sub-progress values ───────────────────────────────
        // Phase 1: first 60% of scroll progress → pivot (rotateY)
        // Phase 2: last  40% of scroll progress → slide (translateX + arc)
        const p1 = Math.max(0, Math.min(1, p / 0.6));
        const p2 = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
        const eased1 = ease(p1);
        const eased2 = ease(p2);

        // ── Property values ──────────────────────────────────────────────────
        // Phase 1: rotateY travels from startRotateY → 0
        const rotateY   = startRotateY * (1 - eased1);

        // Phase 2: card slides from center-line to its resting X position,
        // with a sine-arc Y offset so the slide feels "curving outward"
        const translateX = finalX * eased2;
        const curveY     = -arcY * Math.sin(eased2 * Math.PI);

        // Opacity: mostly hidden at the start, fully visible by end of phase 1
        const opacity = 0.3 + 0.7 * eased1;

        // ── Apply — transform order per spec ─────────────────────────────────
        // translateX/Y in parent space first, then rotateY in the local frame
        card.style.transform =
          `translateX(${translateX}px) translateY(${curveY}px) rotateY(${rotateY}deg)`;
        card.style.opacity = String(opacity);
      });

      ticking.current = false;
    };

    // Single passive scroll listener — shares the rAF tick with the GSAP SVG
    // scroll-line already running on the same page. No second listener added.
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current = requestAnimationFrame(updateCards);
      }
    };

    // Set correct initial state before any scroll
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
     * perspective on the OUTER wrapper creates the 3D stage.
     * overflow must stay visible — translateZ / rotateY need unclipped space.
     */
    <div
      ref={containerRef}
      className="cylinder-projects-wrapper"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      {projects.map((proj, idx) => {
        const isRight = idx % 2 === 0;

        return (
          /*
           * SLOT: stable fixed-size layout container.
           * getBoundingClientRect() on the slot drives the SVG path coordinates
           * AND the scroll-progress formula — neither is affected by the 3D
           * transform on the inner card because only the card element is
           * transformed, not the slot.
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
              overflow: 'visible',
            }}
          >
            {/*
             * CARD: the 3D-animated element.
             *
             * transform-origin differs by card side:
             *   right-resting (even): hinge = LEFT edge  → origin 0% 50%
             *   left-resting  (odd):  hinge = RIGHT edge → origin 100% 50%
             *
             * This keeps the hinge edge fixed on the SVG scroll-line while the
             * rest of the card swings forward (phase 1) and then slides away
             * from the line to its resting position (phase 2).
             *
             * backface-visibility: hidden prevents mirrored card content from
             * showing while rotateY is between 90° and 180°.
             *
             * NO CSS transition on transform — driven purely by JS every frame.
             */}
            <div
              ref={(el) => { cardRefs.current[idx] = el; }}
              className="glass-panel cylinder-card"
              style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: isRight ? '0% 50%' : '100% 50%',
                width: '100%',
                maxWidth: '680px',
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
        );
      })}
    </div>
  );
};
