'use client';

import * as React from 'react';
import { Atom01, Server01, Zap } from '@untitledui/icons';
import { cx } from '@/utils/cx';

/** The three pillars — each mirrors one of the cube's engraved faces and its colour. */
const CARDS = [
  {
    icon: Server01,
    accent: 'border-ossido-orange/25 bg-ossido-orange/10 text-ossido-orange',
    hover: 'hover:border-ossido-orange/40',
    glow: 'var(--color-ossido-orange)',
    target: 'rust',
    focus: 'focus-visible:ring-ossido-orange',
    title: (
      <>
        <span className="text-ossido-orange">Rust</span> backend
      </>
    ),
    body: 'Server-side rendering, static generation, and API routes — all handled by a fast, type-safe Rust core.',
  },
  {
    icon: Atom01,
    accent: 'border-ossido-cyan/25 bg-ossido-cyan/10 text-ossido-cyan',
    hover: 'hover:border-ossido-cyan/40',
    glow: 'var(--color-ossido-cyan)',
    target: 'react',
    focus: 'focus-visible:ring-ossido-cyan',
    title: (
      <>
        <span className="text-ossido-cyan">React</span> frontend
      </>
    ),
    body: 'The full power and familiar simplicity of React, driving every view on the client.',
  },
  {
    icon: Zap,
    accent: 'border-ossido-purple/25 bg-ossido-purple/10 text-ossido-purple',
    hover: 'hover:border-ossido-purple/40',
    glow: 'var(--color-ossido-purple)',
    target: 'tuono',
    focus: 'focus-visible:ring-ossido-purple',
    title: (
      <>
        <span className="text-ossido-purple">Tuono</span> roots
      </>
    ),
    body: 'A modern framework built on the proven foundations of Tuono — Rust and React, together.',
  },
] as const;

type Card = (typeof CARDS)[number];

/** Max tilt away from flat, in degrees — kept gentle so the card only tracks "a little". */
const MAX_TILT = 7;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A pillar card that lifts and tilts toward the pointer (pure CSS transforms — the
 * JS only writes CSS variables), with a "sheen" highlight in the card's accent
 * colour that follows the cursor. A lightweight, React-native take on vanilla-tilt.
 */
function PillarCard({ card }: { card: Card }): React.ReactElement {
  const { icon: Icon, accent, hover, glow, target, focus, title, body } = card;
  const ref = React.useRef<HTMLAnchorElement>(null);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLAnchorElement>): void => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 → 1 across
    const py = (e.clientY - r.top) / r.height; // 0 → 1 down
    // The sheen tracks the pointer horizontally only; the tilt is skipped under reduced motion.
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
    <a
      ref={ref}
      href={`#${target}`}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={
        {
          '--card-glow': glow,
          transform:
            'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(calc(var(--lift, 0) * -6px)) scale(calc(1 + var(--lift, 0) * 0.015))',
          transition: 'transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out',
        } as React.CSSProperties
      }
      className={cx(
        'group relative flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 text-left will-change-transform',
        'cursor-pointer outline-hidden focus-visible:ring-2',
        hover,
        focus,
      )}
    >
      {/* Pointer-following sheen in the card's highlight colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          // Mirror --mx so the sheen sits on the side opposite the cursor.
          background:
            'radial-gradient(circle at calc(100% - var(--mx, 50%)) 50%, color-mix(in srgb, var(--card-glow) 5%, transparent), transparent 120%)',
        }}
      />
      <span
        className={cx(
          'relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg border',
          accent,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="relative flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-primary tracking-tight">{title}</h3>
        <p className="text-sm text-tertiary leading-relaxed">{body}</p>
      </div>
    </a>
  );
}

/** The three-up grid of pillar cards for the home page. */
export function PillarCards(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {CARDS.map((card, i) => (
        <PillarCard key={i} card={card} />
      ))}
    </div>
  );
}
