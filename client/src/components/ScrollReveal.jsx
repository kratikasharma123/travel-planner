import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const revealConfig = {
  left: { x: -70, y: 0 },
  right: { x: 70, y: 0 },
  up: { x: 0, y: 48 },
  down: { x: 0, y: -48 },
};

function getExplicitRevealItems(root) {
  return gsap.utils.toArray('[data-reveal]', root);
}

function getAutoRevealItems(root, selector) {
  return gsap.utils
    .toArray(selector, root)
    .filter((item) => item !== root)
    .filter((item) => !item.matches('[data-reveal]'))
    .filter((item) => !item.closest('[data-reveal]'));
}

function ScrollReveal({
  children,
  className = '',
  autoReveal = false,
  selector = 'section, article, [data-auto-reveal]',
  stagger = 0.08,
  once = false,
}) {
  const rootRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || reduceMotion) return undefined;

    const context = gsap.context(() => {
      const explicitItems = getExplicitRevealItems(root);

      explicitItems.forEach((item) => {
        const direction = item.dataset.reveal || 'up';
        const config = revealConfig[direction] || revealConfig.up;
        const delay = Number(item.dataset.revealDelay || 0);

        gsap.fromTo(
          item,
          { autoAlpha: 0, x: config.x, y: config.y },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            delay,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 86%',
              toggleActions: once ? 'play none none none' : 'play none none reverse',
              once,
            },
          }
        );
      });

      if (autoReveal) {
        const autoItems = getAutoRevealItems(root, selector);

        autoItems.forEach((item, index) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 38, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.75,
              delay: Math.min(index * stagger, 0.28),
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: once ? 'play none none none' : 'play none none reverse',
                once,
              },
            }
          );
        });
      }

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => context.revert();
  }, [autoReveal, location.pathname, once, selector, stagger]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

export default ScrollReveal;
