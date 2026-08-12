import React, { useId } from 'react';

import { ELECTRON_PX, ORBIT_RADIUS } from './constants';

export interface ElectronShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter in px. */
  size?: number;
  /** Number of electrons evenly spaced around the shell. */
  electrons?: number;
  /** Seconds per full revolution. */
  duration?: number;
  /** Orbit the other way. */
  reverse?: boolean;
  /** Colour of the orbit ring and its electrons. */
  color?: string;
  /** Rotate the electrons' resting positions (radians) so shells don't align. */
  startAngle?: number;
}

/** One electron shell: a faint orbit ring with `electrons` small outline circles
 * spaced evenly around it, orbiting continuously (same compositor-friendly spin as
 * the word rings). Electrons stay a fixed pixel size regardless of shell radius. */
export const ElectronShell: React.FC<ElectronShellProps> = ({
  size = 600,
  electrons = 6,
  duration = 60,
  reverse = false,
  color = 'rgba(255,255,255,0.45)',
  startAngle = 0,
  style,
  ...props
}) => {
  const maskId = `orbit-mask-${useId().replace(/:/g, '')}`;
  const electronR = (ELECTRON_PX / 2) * (100 / size); // fixed px diameter in viewBox units
  const dots = Array.from({ length: electrons }, (_, i) => {
    const a = (i / electrons) * Math.PI * 2 - Math.PI / 2 + startAngle;
    return {
      cx: 50 + ORBIT_RADIUS * Math.cos(a),
      cy: 50 + ORBIT_RADIUS * Math.sin(a),
    };
  });

  return (
    // `color` sets the SVG's currentColor, so it resolves CSS variables (light/dark)
    // that a bare fill="var(...)" attribute would not.
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        pointerEvents: 'none',
        color,
        ...style,
      }}
      {...props}
    >
      <div
        className="size-full origin-center will-change-transform animate-[rotate_var(--spin)_linear_infinite] motion-reduce:animate-none"
        style={
          {
            '--spin': `${duration}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          } as React.CSSProperties
        }
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Punch a hole in the orbit ring behind each electron so the line
              doesn't show through the hollow circle (electrons read as beads). */}
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="-10" y="-10" width="120" height="120" fill="white" />
            {dots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r={electronR} fill="black" />
            ))}
          </mask>
          {/* One opacity for the orbit line and the electron outlines, so they read as
              the same colour (the electrons otherwise looked brighter than the ring). */}
          <g opacity={0.4}>
            <circle
              cx="50"
              cy="50"
              r={ORBIT_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              mask={`url(#${maskId})`}
            />
            {dots.map((d, i) => (
              // Hollow outline; the solid core is drawn separately, a touch brighter.
              <circle
                key={i}
                cx={d.cx}
                cy={d.cy}
                r={electronR}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          {/* Solid electron cores, ~20% brighter than the rest of the shell. */}
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={electronR * 0.36}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
