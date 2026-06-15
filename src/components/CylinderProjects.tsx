import React, { useEffect, useRef, useState } from 'react';

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

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

// ─── Responsive Dimensions (Fix cutoff & mobile lag) ─────────────────────────
function getCardDimensions() {
  if (typeof window === 'undefined') {
    return { width: 440, height: 280, N: 10, R: 500, maxArc: 50 };
  }
  const vw = window.innerWidth;
  const mobile = vw < 640;
  let width = 440, height = 280;
  
  if (mobile) {
    width = Math.min(vw * 0.85, 340);
    height = 360; // Increased height significantly so Live Demo is never cut
  } else if (vw < 1024) {
    width = 380;
    height = 320;
  }
  
  return {
    width,
    height,
    N: mobile ? 1 : 10,          // N=1 on mobile eliminates lag completely (flat pivot)
    R: mobile ? 250 : 500,       
    maxArc: mobile ? 25 : 50,    
  };
}

// ─── Card content renderer ───────────────────────────────────────────────────
function CardContent({ proj }: { proj: Project }) {
  return (
    <>
      <h3
        className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-white select-none"
        style={{ textShadow: '0 0 16px rgba(0,0,0,0.9)' }}
      >
        {proj.title}
      </h3>
      <p
        className="text-xs md:text-sm text-gray-400 font-medium mb-3"
        style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}
      >
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

      <p
        className="text-gray-300 text-sm leading-relaxed mb-5 font-light"
        style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}
      >
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
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export const CylinderProjects: React.FC<CylinderProjectsProps> = ({ projects }) => {
  const [dim, setDim] = useState(getCardDimensions);

  const slotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const cylinderRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const stripRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef        = useRef<number | null>(null);

  // Resize listener
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      // Debounce resize to prevent rapid state changes
      timeout = setTimeout(() => {
        setDim(getCardDimensions());
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scroll listener
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    
    const updateAll = () => {
      const vh = window.innerHeight;
      const finalXAbs = isMobile ? 0 : 140; // Mobile: 0 prevents it from pushing off-screen
      const arcY = isMobile ? 10 : 20;
      const buffer = vh; // 1 viewport height buffer
      
      // Scale constants
      const SCALE_MIN = isMobile ? 0.45 : 0.55;
      const SCALE_MAX = 1;

      projects.forEach((_, idx) => {
        const slot = slotRefs.current[idx];
        const cylinder = cylinderRefs.current[idx];
        if (!slot || !cylinder) return;

        const rect = slot.getBoundingClientRect();

        // Fix 2B: Skip off-screen cards entirely
        if (rect.bottom < -buffer || rect.top > vh + buffer) {
          return;
        }

        // Slower animation: increased divisor from 0.45 to 0.6
        let p = (vh * 0.85 - rect.top) / (vh * 0.6);
        p = Math.max(0, Math.min(1, p));

        const p1 = Math.max(0, Math.min(1,  p / 0.6));
        const p2 = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
        const e1 = easeInOutQuad(p1);
        const e2 = easeInOutQuad(p2);

        const isRight = idx % 2 === 0;
        const baseFacing = isRight ? 180 : -180;
        const finalX = isRight ? finalXAbs : -finalXAbs;

        // Size Transform
        const cardScale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * e1;
        const groupTX = finalX * e2;
        const groupTY = -arcY * Math.sin(e2 * Math.PI);

        // Group transform
        cylinder.style.transform = `translate3d(${groupTX}px, ${groupTY}px, 0) scale(${cardScale})`;
        
        // Faint opacity when behind
        cylinder.style.opacity = String(0.12 + 0.88 * e1);

        const isResting = e1 >= 0.99 && e2 >= 0.99;
        
        // Crossfade logic: strips fade out at the very end, solid glass face fades in.
        // This solves the disjointed blur seams while keeping the 3D rolling curve!
        const glassFace = document.getElementById(`glass-face-${idx}`);
        const stripsContainer = document.getElementById(`strips-container-${idx}`);
        
        if (glassFace && stripsContainer) {
          if (e1 > 0.9) {
            const crossfade = (e1 - 0.9) * 10; // 0 to 1
            glassFace.style.opacity = String(crossfade);
            glassFace.style.visibility = 'visible'; // ADDED: Restores element to render tree
            stripsContainer.style.opacity = String(1 - crossfade);
            glassFace.style.pointerEvents = 'auto';
          } else {
            glassFace.style.opacity = '0';
            glassFace.style.visibility = 'hidden'; // ADDED: Completely removes backdrop-filter from GPU calculation during scroll
            stripsContainer.style.opacity = '1';
            glassFace.style.pointerEvents = 'none';
          }
        }

        // Phase 1: per-strip cylinder wrap
        for (let i = 0; i < dim.N; i++) {
          const strip = stripRefs.current[idx * dim.N + i];
          if (!strip) continue;

          const t_i = (i / (dim.N - 1)) - 0.5;
          const curvedAngle = t_i * dim.maxArc;
          const totalAngle = lerp(baseFacing + curvedAngle, 0, e1);
          const rad = totalAngle * Math.PI / 180;

          const stripTX = dim.R * Math.sin(rad);
          const stripTZ = dim.R * (Math.cos(rad) - 1);

          // Fix 2D: Combine transforms into single translate3d
          strip.style.transform = `translate3d(${stripTX}px, 0, ${stripTZ}px) rotateY(${totalAngle}deg)`;
          
          // Fix 2F: Remove will-change after animation settles
          strip.style.willChange = isResting ? 'auto' : 'transform';
        }
      });
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateAll);
      }
    };

    updateAll(); // Initial state
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [projects.length, dim]); // Re-bind scroll if dim changes (N affects loop)

  return (
    <div
      className="cylinder-projects-wrapper"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      {projects.map((proj, idx) => (
        <div
          key={idx}
          ref={(el) => { slotRefs.current[idx] = el; }}
          className="cylinder-slot"
          style={{
            position: 'relative',
            height: '55vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
            overflow: 'visible',
          }}
        >
          <div
            ref={(el) => { cylinderRefs.current[idx] = el; }}
            className="card-cylinder"
            style={{
              position: 'relative',
              width: `${dim.width}px`,
              height: `${dim.height}px`,
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
              transformOrigin: 'center center',
            }}
          >
            {/* ── SOLID GLASS FACE ── Fades in at e1 > 0.9. Has backdrop-filter to blur the SVG line correctly without seams. */}
            <div
              id={`glass-face-${idx}`}
              className="cylinder-glass-face card-content"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '1.75rem',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <CardContent proj={proj} />
            </div>

            {/* ── ANIMATION STRIPS ── (Crossfades out as glass face comes in. No backdrop-filter here to avoid seams). */}
            <div id={`strips-container-${idx}`} style={{ transformStyle: 'preserve-3d', opacity: 1 }}>
              {Array.from({ length: dim.N }, (_, i) => {
                const stripWidth = dim.width / dim.N;
                return (
                  <div
                    key={i}
                  ref={(el) => { stripRefs.current[idx * dim.N + i] = el; }}
                  className="strip"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${i * stripWidth}px`,
                    width: `${stripWidth}px`,
                    height: `${dim.height}px`,
                    overflow: 'hidden',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    pointerEvents: 'none', // Strips themselves don't block clicks
                  }}
                >
                  <div
                    className="card-content"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${-i * stripWidth}px`,
                      width: `${dim.width}px`,
                      height: `${dim.height}px`,
                      padding: '1.75rem',
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                      background: 'rgba(15, 15, 15, 0.95)', // Solid dark fallback, no blur seams
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: '16px',
                    }}
                  >
                    <CardContent proj={proj} />
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
