import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ id, className = '', children }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Bypasses animations and displays the content instantly
      gsap.set(sectionEl, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top 85%', // starts when the top of the section enters 85% of the viewport height
            toggleActions: 'play none none none', // animate once as we scroll down
          },
        }
      );
    });

    return () => ctx.revert(); // cleanup ScrollTriggers and animations on unmount
  }, []);

  return (
    <section id={id} ref={sectionRef} className={className} style={{ opacity: 0 }}>
      {children}
    </section>
  );
};
