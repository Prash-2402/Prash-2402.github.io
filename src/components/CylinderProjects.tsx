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

const easeInOutQuad = (x: number): number =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

export const CylinderProjects: React.FC<CylinderProjectsProps> = ({ projects }) => {
  // slotRefs  — stable layout containers; getBoundingClientRect() here is
  //             unaffected by any 3D transform applied to the inner card shell.
  const slotRefs  = useRef<(HTMLDivElement | null)[]>([]);
  // shellRefs — the element that actually receives the JS transform each frame.
  //             It is intentionally kept free of backdrop-filter so it does NOT
  //             create a new stacking context that would flatten preserve-3d.
  const shellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef    = useRef<number | null>(null);
  const ticking   = useRef(false);

  useEffect(() => {
    const slots  = slotRefs.current.filter(Boolean)  as HTMLDivElement[];
    const shells = shellRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!slots.length || !shells.length) return;

    const isMobile = () => window.innerWidth < 640;

    const updateCards = () => {
      const vh     = window.innerHeight;
      const mobile = isMobile();
      // Mobile: tighter offsets so cards don't clip off small screens
      const finalXAbs = mobile ? 50 : 140;
      const arcY      = mobile ? 10 : 20;

      slots.forEach((slot, idx) => {
        const shell = shells[idx];
        if (!shell) return;

        // ── Live scroll progress — recalculated every frame, never cached ────
        const rect  = slot.getBoundingClientRect();   // slot, not shell
        let   p     = (vh * 0.85 - rect.top) / (vh * 0.65);
        p = Math.max(0, Math.min(1, p));

        // Phase split: 0–60% = pivot, 60–100% = slide
        const p1    = Math.max(0, Math.min(1,  p / 0.6));
        const p2    = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
        const e1    = easeInOutQuad(p1);
        const e2    = easeInOutQuad(p2);

        // ── Right-resting (even) hinges on left edge (+180 → 0) ─────────────
        // ── Left-resting  (odd) hinges on right edge (-180 → 0) ─────────────
        const isRight     = idx % 2 === 0;
        const startRotate = isRight ? 180 : -180;
        const finalX      = isRight ? finalXAbs : -finalXAbs;

        // Phase 1: rotate toward viewer
        const rotateY    = startRotate * (1 - e1);
        // Phase 1: push back in Z (starts -120, reaches 0 when fully pivoted)
        const translateZ = -120 * (1 - e1);
        // Phase 2: slide to resting X with gentle arc
        const translateX = finalX * e2;
        const curveY     = -arcY * Math.sin(e2 * Math.PI);
        // Opacity: faint silhouette at back → fully visible by end of phase 1
        const opacity    = 0.25 + 0.75 * e1;

        // ── Apply — order is critical for correct 3D compositing ─────────────
        shell.style.transform =
          `translateX(${translateX}px) translateY(${curveY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
        shell.style.opacity = String(opacity);
      });

      ticking.current = false;
    };

    // Single passive scroll listener — same rAF-tick pattern as GSAP's
    // ScrollTrigger so they coexist without competing.
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current  = requestAnimationFrame(updateCards);
      }
    };

    updateCards(); // set correct initial state before first user scroll
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
     * ─── ROOT CAUSE 1 FIX ─────────────────────────────────────────────────
     * perspective MUST be on an ancestor, NOT the card. Without it, rotateY
     * looks like a flat horizontal squish, not real 3D depth.
     *
     * MUST NOT have: overflow:hidden, overflow:auto, or transform
     * Any of these create a new stacking context that flattens the 3D context.
     */
    <div
      className="cylinder-projects-wrapper"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        overflow: 'visible',
      }}
    >
      {projects.map((proj, idx) => {
        const isRight = idx % 2 === 0;

        return (
          /*
           * ─── ROOT CAUSE 5 FIX ───────────────────────────────────────────
           * SLOT: fixed height: 90vh — never collapses regardless of card's
           * animated state. This is also what getBoundingClientRect() reads
           * for scroll progress — it must not change as the card transforms.
           *
           * transform-style: preserve-3d here is the critical link in the chain:
           *   perspective-wrapper → slot (preserve-3d) → shell → rotates in 3D
           * Remove this and the card becomes flat again.
           */
          <div
            key={idx}
            ref={(el) => { slotRefs.current[idx] = el; }}
            className="cylinder-slot"
            style={{
              position: 'relative',
              height: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d', // ← CRITICAL link in 3D chain
              overflow: 'visible',
            }}
          >
            {/*
             * ─── ROOT CAUSE 2 + 3 + 4 FIX ─────────────────────────────────
             * SHELL: the 3D-animated element. Receives JS transform every frame.
             *
             * KEY DESIGN DECISION — two-layer approach:
             *   Shell (this div): gets rotateY/translateZ from JS.
             *                     NO backdrop-filter — backdrop-filter creates
             *                     a stacking context that OVERRIDES transform-style
             *                     to 'flat', killing the 3D chain entirely.
             *   Inner panel:      gets the glass visual (backdrop-filter, bg, border).
             *                     Never transformed — purely visual.
             *
             * transform-origin: per card — left edge for right-resting cards
             * (hinge on left, card swings rightward out of the line), right
             * edge for left-resting cards.
             *
             * backface-visibility: NOT SET (not hidden) — at rotateY≈180° the
             * card's back face is faintly visible as a translucent silhouette
             * (opacity=0.25). This is the intended "behind the line" visual cue.
             * If backface-visibility:hidden were set, the card would be fully
             * INVISIBLE at p=0 and would appear to suddenly pop in mid-scroll.
             */}
            <div
              ref={(el) => { shellRefs.current[idx] = el; }}
              className="cylinder-shell"
              style={{
                transformStyle: 'preserve-3d', // keep chain alive for children
                transformOrigin: isRight ? '0% 50%' : '100% 50%',
                willChange: 'transform, opacity',
                width: '100%',
                maxWidth: '680px',
                // NO transition on transform/opacity — set via JS every frame
              }}
            >
              {/* Inner visual layer — glass morphism lives here, isolated from 3D */}
              <div className="cylinder-card-inner">
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
          </div>
        );
      })}
    </div>
  );
};
