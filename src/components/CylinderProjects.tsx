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

// ─── Constants ───────────────────────────────────────────────────────────────
const N               = 10;    // vertical strip count per card
const R               = 500;   // cylinder radius in px
const MAX_ANGLE_SPAN  = 50;    // total angular arc of card on cylinder (deg)
const CARD_HEIGHT     = 400;   // fixed height in px — all cards same height

const easeInOutQuad = (x: number): number =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

// ─── Card content renderer (used both in strips and in the glass face) ───────
// Declared outside the component so it doesn't re-create on every render.
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
  // slotRefs    — immovable layout containers. getBoundingClientRect() here
  //               is unaffected by any transform on child elements, so scroll
  //               progress and the SVG line's y-coordinates stay accurate.
  const slotRefs      = useRef<(HTMLDivElement | null)[]>([]);

  // cylinderRefs — receive Phase 2 group transform (translateX slide + arc).
  //                NO rotateY here — only strips rotate.
  const cylinderRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // glassFaceRefs — flat visual glass panel that fades in as e1 → 1.
  //                 Holds the REAL interactive card content.
  const glassFaceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // stripRefs — flat array. Index: cardIdx * N + stripIdx.
  //             Each strip element receives Phase 1 per-strip cylinder math.
  const stripRefs     = useRef<(HTMLDivElement | null)[]>([]);

  const rafRef   = useRef<number | null>(null);
  const ticking  = useRef(false);

  useEffect(() => {
    const isMobile = () => window.innerWidth < 640;

    const updateAll = () => {
      const vh     = window.innerHeight;
      const mobile = isMobile();
      const finalXAbs = mobile ? 50  : 140;
      const arcY      = mobile ? 10  : 20;

      projects.forEach((_, idx) => {
        const slot      = slotRefs.current[idx];
        const cylinder  = cylinderRefs.current[idx];
        const glassFace = glassFaceRefs.current[idx];
        if (!slot || !cylinder) return;

        // ── Scroll progress ──────────────────────────────────────────────────
        // Read from SLOT, not card — slot is untransformed so rect is stable.
        const rect = slot.getBoundingClientRect();

        // Updated divisor for 55vh slots (tighter trigger window)
        let p = (vh * 0.85 - rect.top) / (vh * 0.45);
        p = Math.max(0, Math.min(1, p));

        // Phase split: first 60% = pivot (Phase 1), last 40% = slide (Phase 2)
        const p1 = Math.max(0, Math.min(1,  p / 0.6));
        const p2 = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
        const e1 = easeInOutQuad(p1);
        const e2 = easeInOutQuad(p2);

        const isRight    = idx % 2 === 0;
        const baseFacing = isRight ? 180 : -180;  // starting rotateY per side
        const finalX     = isRight ? finalXAbs : -finalXAbs;

        // ── Phase 2: group slide on .card-cylinder ───────────────────────────
        // Only translateX + arc Y — no rotation on the cylinder group itself.
        cylinder.style.transform =
          `translateX(${finalX * e2}px) translateY(${-arcY * Math.sin(e2 * Math.PI)}px)`;
        cylinder.style.opacity = String(0.12 + 0.88 * e1);

        // Glass face fades in as card faces the viewer (e1 → 1)
        if (glassFace) {
          glassFace.style.opacity = String(easeInOutQuad(e1));
        }

        // ── Phase 1: per-strip cylinder wrap ────────────────────────────────
        // Each strip i has a slightly different angle on the cylinder,
        // creating visible CURVATURE instead of a flat rotating plane.
        for (let i = 0; i < N; i++) {
          const strip = stripRefs.current[idx * N + i];
          if (!strip) continue;

          // t_i runs −0.5 (leftmost strip) → +0.5 (rightmost strip)
          const t_i         = (i / (N - 1)) - 0.5;
          const curvedAngle = t_i * MAX_ANGLE_SPAN;

          // Each strip has its own angle: starts at baseFacing ± curvedAngle,
          // lerps toward 0 as e1 → 1 so all strips end up flat and aligned.
          const totalAngle = lerp(baseFacing + curvedAngle, 0, e1);
          const rad        = totalAngle * Math.PI / 180;

          // Cylinder parametric equations: place strip on cylinder surface.
          // At totalAngle=0: sin=0, cos=1 → translateX=0, translateZ=0 ✓
          const stripTX = R * Math.sin(rad);
          const stripTZ = R * (Math.cos(rad) - 1);  // 0 when facing, −depth behind

          // Order matters: translate first (world space), then rotate (local)
          strip.style.transform =
            `translateX(${stripTX}px) translateZ(${stripTZ}px) rotateY(${totalAngle}deg)`;
        }
      });

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current  = requestAnimationFrame(updateAll);
      }
    };

    updateAll(); // correct initial state before first scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateAll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateAll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [projects.length]);

  return (
    // ── PERSPECTIVE WRAPPER ─────────────────────────────────────────────────
    // Must NOT have: overflow:hidden, transform, or any property that creates
    // a new stacking context — these flatten the 3D context for descendants.
    <div
      className="cylinder-projects-wrapper"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      {projects.map((proj, idx) => (
        // ── SLOT ─────────────────────────────────────────────────────────────
        // Fixed height: 55vh — never collapses from card animation.
        // transform-style: preserve-3d is the critical link:
        //   perspective-wrapper → slot → cylinder → strips (all in same 3D space)
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
            transformStyle: 'preserve-3d', // ← critical — passes 3D context down
            overflow: 'visible',
          }}
        >
          {/* ── CARD CYLINDER ────────────────────────────────────────────────
              Receives Phase 2 group transform (translateX slide + arc Y only).
              The cylinder itself does NOT rotate — only the strips inside do.
              transform-style: preserve-3d must be here so strip transforms
              are in the same 3D space as the perspective wrapper.           */}
          <div
            ref={(el) => { cylinderRefs.current[idx] = el; }}
            style={{
              position: 'relative',
              width: 'min(640px, calc(100vw - 40px))',
              height: `${CARD_HEIGHT}px`,
              transformStyle: 'preserve-3d', // passes 3D context to strips
              willChange: 'transform, opacity',
            }}
          >
            {/* ── GLASS FACE ────────────────────────────────────────────────
                Flat visual layer at z=0. Contains the REAL interactive card
                content (links, etc.) — pointer-events: auto.
                Fades in as e1 → 1 (card fully facing viewer).
                backdrop-filter is isolated HERE (not on strips) so it does
                not create a stacking context inside the 3D strip chain.
                Starts at opacity=0 so animation strips dominate at p=0.    */}
            <div
              ref={(el) => { glassFaceRefs.current[idx] = el; }}
              className="cylinder-glass-face"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                padding: '1.75rem',
                boxSizing: 'border-box',
                opacity: 0, // JS controls: fades to 1 as e1 → 1
                zIndex: 10, // above strips in DOM — receives pointer events
              }}
            >
              <CardContent proj={proj} />
            </div>

            {/* ── STRIPS ────────────────────────────────────────────────────
                N=10 vertical slices. Each is a "window" (overflow:hidden)
                into a full-width clone of the card content.

                Anatomy of the slice window trick:
                  - strip: position:absolute; left: i*10%; width:10%; overflow:hidden
                  - inner content: position:absolute; left: -i*100% (of strip width)
                                   width: N*100% = 1000% (= full card width)

                At e1=1 all strip transforms are identity → strips tile flush.
                At e1<1 strips fan around the cylinder, each at curvedAngle_i.

                pointer-events: none — the glass face above handles interaction.
                NO backface-visibility:hidden — we want faint back-face visible.
                NO backdrop-filter — would break transform-style: preserve-3d. */}
            {Array.from({ length: N }, (_, i) => (
              <div
                key={i}
                ref={(el) => { stripRefs.current[idx * N + i] = el; }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${i * 10}%`,           // natural tiled position
                  width: '10%',                  // 1/N of card width
                  height: `${CARD_HEIGHT}px`,
                  overflow: 'hidden',            // clips to show only this slice
                  transformStyle: 'preserve-3d', // ← must NOT break the chain
                  willChange: 'transform',
                  pointerEvents: 'none',
                }}
              >
                {/* Content positioned so the overflow:hidden window shows
                    exactly the i-th horizontal slice of the full card layout.
                    left: -i*100% shifts the content left by i strip-widths.
                    width: N*100% = full card width (N × strip width).         */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${-i * 100}%`, // -0%, -100%, -200%, ..., -900% of strip
                    width: `${N * 100}%`, // 1000% of strip = full card width
                    height: `${CARD_HEIGHT}px`,
                    padding: '1.75rem',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                >
                  <CardContent proj={proj} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
