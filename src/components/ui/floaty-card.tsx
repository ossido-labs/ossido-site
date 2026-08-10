'use client';

import * as React from 'react';
import { Link } from '@ossido-labs/ossido';
import { cx } from '@/utils/cx';

/** Max tilt away from flat, in degrees - gentle so the card only tracks "a little". */
const MAX_TILT = 6;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface FloatyCardProps {
  href: string;
  /** Colour of the pointer-following sheen. Defaults to a neutral gray. */
  glow?: string;
  /** Classes for the card surface (padding, height, etc.). */
  className?: string;
  /** Classes for the inner content wrapper (layout of the children). */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * A card that lifts and tilts toward the pointer (pure CSS transforms - the JS only
 * writes CSS variables) with a soft sheen that follows the cursor. The same
 * interaction as the home-page pillar cards, but defaulting to a neutral gray
 * sheen. Renders an ossido `Link` so the whole card navigates client-side.
 */
export function FloatyCard({
  href,
  glow = 'var(--color-fg-primary)',
  className,
  contentClassName,
  children,
}: FloatyCardProps): React.ReactElement {
  const ref = React.useRef<HTMLAnchorElement>(null);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLAnchorElement>): void => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 → 1 across
    const py = (e.clientY - r.top) / r.height; // 0 → 1 down
    el.style.setProperty('--mx', `${px * 100}%`);
    if (prefersReducedMotion()) return;
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT}deg`);
  }, []);

  const onPointerEnter = React.useCallback((): void => {
    if (prefersReducedMotion()) return;
    ref.current?.style.setProperty('--lift', '1');
  }, []);

  const onPointerLeave = React.useCallback((): void => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0');
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={
        {
          '--card-glow': glow,
          transform:
            'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(calc(var(--lift, 0) * -6px)) scale(calc(1 + var(--lift, 0) * 0.01))',
          transition:
            'transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out',
          boxShadow:
            '0 calc(var(--lift, 0) * 20px) calc(var(--lift, 0) * 45px) rgb(0 0 0 / calc(var(--lift, 0) * 0.35))',
        } as React.CSSProperties
      }
      className={cx(
        'group relative block overflow-hidden rounded-2xl border border-secondary bg-primary outline-hidden will-change-transform',
        'hover:border-primary focus-visible:ring-2 focus-visible:ring-ossido-orange',
        className,
      )}
    >
      {/* Pointer-following gray sheen, mirrored so it sits opposite the cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at calc(100% - var(--mx, 50%)) 50%, color-mix(in srgb, var(--card-glow) 7%, transparent), transparent 120%)',
        }}
      />
      <div className={cx('relative', contentClassName)}>{children}</div>
    </Link>
  );
}
