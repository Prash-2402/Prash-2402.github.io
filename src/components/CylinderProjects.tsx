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

export const CylinderProjects: React.FC<CylinderProjectsProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const isMobile = () => window.innerWidth < 640;

    const updateCards = () => {
      const vh = window.innerHeight;
      const viewportCenter = vh / 2;
      const mobile = isMobile();
      const maxRotate = mobile ? 45 : 75;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenterY = rect.top + rect.height / 2;
        const dist = cardCenterY - viewportCenter;

        // Normalise: clamp to [-1, 1] over ±55% of viewport height
        const rawNorm = dist / (vh * 0.55);
        const norm = Math.max(-1, Math.min(1, rawNorm));

        const rotateX = norm * maxRotate;
        const translateZ = -Math.abs(norm) * 140;
        const opacity = Math.max(0.05, 1 - Math.abs(norm) * 0.9);

        // Directly set style — NO CSS transition, must follow scroll instantly
        card.style.transform = `rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
        card.style.opacity = String(opacity);
      });

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current = requestAnimationFrame(updateCards);
      }
    };

    // Run once on mount so cards are correct before any scroll
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
     * perspective is set on the OUTER wrapper — not on the cards themselves.
     * overflow must NOT be hidden here; 3D translateZ needs room to render.
     */
    <div
      ref={containerRef}
      className="cylinder-projects-wrapper"
      style={{ perspective: '1100px', perspectiveOrigin: '50% 50%' }}
    >
      {projects.map((proj, idx) => (
        /*
         * Each "slot" is ~90vh tall and acts as a stage for one card.
         * display: flex + align-items: center keeps the card vertically
         * centred within its slot so the viewport-centre calculation is stable.
         */
        <div
          key={idx}
          className="cylinder-slot"
          style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          <div
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="glass-panel cylinder-card"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
              width: '100%',
              maxWidth: '680px',
              /* NO transition property — transform is driven by JS/rAF */
            }}
          >
            {/* Card header */}
            <h3 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-white select-none">
              {proj.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-3">
              {proj.subtitle}
            </p>

            {/* Tags */}
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

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
              {proj.desc}
            </p>

            {/* Live link */}
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
