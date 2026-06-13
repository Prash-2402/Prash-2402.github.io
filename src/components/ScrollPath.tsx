import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionIds = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

export const ScrollPath: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<SVGPathElement>(null);
  const glowLineRef = useRef<SVGPathElement>(null);
  const htmlDotRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<{ x: number; y: number; id: string }[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Recalculate section positions and update the SVG dimensions
  const updatePathLayout = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    setDimensions({ width: containerWidth, height: docHeight });

    // Gather vertical centers of each section
    const positions = sectionIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return { y: 0, id };
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const centerY = rect.top + scrollTop + rect.height / 2;
      return { y: centerY, id };
    });

    // Sort by vertical position
    positions.sort((a, b) => a.y - b.y);

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;

    // Define X offset parameters for responsive design
    // Desktop: slightly left of center (40%)
    // Tablet: slightly left of center (45%)
    // Mobile: centered (50%)
    let baseX = containerWidth * 0.40;
    let offsetAmount = 40; // wave intensity

    if (isMobile) {
      baseX = containerWidth * 0.50;
      offsetAmount = 8; // gentle curve on mobile
    } else if (isTablet) {
      baseX = containerWidth * 0.45;
      offsetAmount = 20; // medium curve on tablet
    }

    const generatedPoints = [];

    // Start point at the top of the page (Y = 0)
    generatedPoints.push({ x: baseX, y: 0, id: 'start' });

    // Add alternating coordinates for each section to build a smooth wave
    positions.forEach((pos, idx) => {
      const isLeft = idx % 2 === 0;
      const x = baseX + (isLeft ? -offsetAmount : offsetAmount);
      generatedPoints.push({ x, y: pos.y, id: pos.id });
    });

    // End point at the bottom of the page (Y = docHeight)
    generatedPoints.push({ x: baseX, y: docHeight, id: 'end' });

    setPoints(generatedPoints);
  };

  // Recalculate on load, resize, and DOM changes
  useEffect(() => {
    updatePathLayout();

    // Resize listener
    window.addEventListener('resize', updatePathLayout);

    // Watch for document layout changes (e.g. image loads, text layout updates)
    const resizeObserver = new ResizeObserver(() => {
      updatePathLayout();
    });
    resizeObserver.observe(document.body);

    // Run layout calculation after standard delay times to catch delayed rendering
    const timer1 = setTimeout(updatePathLayout, 100);
    const timer2 = setTimeout(updatePathLayout, 600);

    return () => {
      window.removeEventListener('resize', updatePathLayout);
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Track active section to highlight the nearest path anchor
  useEffect(() => {
    if (points.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 50%', // active when section center enters middle of viewport
        end: 'bottom 50%',
        onToggle: self => {
          if (self.isActive) {
            setActiveSection(id);
          }
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach(st => st.kill());
    };
  }, [points]);

  // Handle scroll tracking logic (drawing path progress and moving the glowing dot)
  useEffect(() => {
    if (points.length === 0) return;
    const progressPath = progressLineRef.current;
    const glowPath = glowLineRef.current;
    if (!progressPath || !glowPath) return;

    const length = progressPath.getTotalLength();
    
    progressPath.style.strokeDasharray = `${length}`;
    progressPath.style.strokeDashoffset = `${length}`;
    glowPath.style.strokeDasharray = `${length}`;
    glowPath.style.strokeDashoffset = `${length}`;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      progressPath.style.strokeDashoffset = '0';
      glowPath.style.strokeDashoffset = '0';
      if (htmlDotRef.current) {
        htmlDotRef.current.style.display = 'none';
      }
      return;
    }

    // GSAP ScrollTrigger timeline to animate path reveal and traveling dot
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1, // slightly faster scrub for snap response
      },
    });

    tl.to([progressPath, glowPath], {
      strokeDashoffset: 0,
      ease: 'none',
      onUpdate: function () {
        const progress = this.progress(); // 0 to 1
        const currentLength = progress * length;
        try {
          const point = progressPath.getPointAtLength(currentLength);
          if (htmlDotRef.current) {
            // Offset by half-width/height of the 12px dot (6px) to center it on the path
            const x = point.x - 6;
            const y = point.y - 6;
            htmlDotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          }
        } catch (e) {
          // Catch potential SVG getPointAtLength calls during layout redraws
        }
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === document.body) {
          st.kill();
        }
      });
    };
  }, [points]);

  // Generates vertical tangent smooth cubic bezier curves (C1 continuity)
  const generatePathString = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const dy = p1.y - p0.y;
      
      // Control points align vertically with start/end to force a vertical entry/exit tangent
      const cp1x = p0.x;
      const cp1y = p0.y + dy * 0.35;
      const cp2x = p1.x;
      const cp2y = p1.y - dy * 0.35;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const pathD = generatePathString(points);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full pointer-events-none z-[-1] overflow-hidden"
      style={{ height: dimensions.height }}
    >
      {points.length > 0 && (
        <>
          <svg
            width="100%"
            height={dimensions.height}
            className="overflow-visible"
          >
            {/* Base Background Path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Layer 1: Wider semi-transparent progress stroke underneath (GPU-accelerated vector glow) */}
            <path
              ref={glowLineRef}
              d={pathD}
              fill="none"
              stroke="rgba(0, 212, 255, 0.25)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Layer 2: Main sharp progress highlight path */}
            <path
              ref={progressLineRef}
              d={pathD}
              fill="none"
              stroke="#00D4FF"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Interactive Section Anchor Dots */}
            {points
              .filter(pt => pt.id !== 'start' && pt.id !== 'end')
              .map(pt => {
                const isActive = activeSection === pt.id;
                return (
                  <g key={pt.id} className="pointer-events-auto">
                    {/* Outer glow ring for active section */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="16"
                        fill="rgba(0, 212, 255, 0.15)"
                        className="glowing-dot-pulse transition-all duration-300"
                      />
                    )}
                    {/* The Anchor Point dot itself */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 8 : 5}
                      fill={isActive ? '#00D4FF' : '#050505'}
                      stroke={isActive ? '#00D4FF' : 'rgba(255, 255, 255, 0.3)'}
                      strokeWidth={isActive ? 3 : 2}
                      className="transition-all duration-300 ease-out cursor-pointer"
                      onClick={() => {
                        const el = document.getElementById(pt.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                  </g>
                );
              })}
          </svg>

          {/* GPU-Accelerated Traveling Glowing Dot (12px wide, box-shadow glow) */}
          <div
            ref={htmlDotRef}
            className="absolute w-[12px] h-[12px] rounded-full bg-white border-2 border-[#00D4FF] shadow-[0_0_8px_#00D4FF,_0_0_16px_rgba(0,212,255,0.7)] glowing-dot-pulse pointer-events-none"
            style={{
              left: 0,
              top: 0,
              transform: 'translate3d(0px, 0px, 0px)',
              willChange: 'transform',
              zIndex: 20,
            }}
          />
        </>
      )}
    </div>
  );
};

