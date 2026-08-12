import * as React from 'react';

import {
  NOTO_STACK,
  OXIDE_TRANSLATIONS,
  RING_CIRCLE_PATH,
  RING_CIRCUMFERENCE,
  RING_FILL_FRACTION,
  WORD_SEPARATOR,
} from './constants';

/** useLayoutEffect on the client, useEffect on the server (avoids SSR warnings). */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export interface WordRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter in px. */
  size?: number;
  /** Seconds per full revolution - the marquee speed. */
  duration?: number;
  /** Spin the other way (nice for an inner ring counter-rotating the outer one). */
  reverse?: boolean;
  /** Text colour. */
  color?: string;
  /** Font size in the 0-100 viewBox units. Auto-shrunk if the words would overflow. */
  fontSize?: number;
  /** CSS font-family stack. Defaults to a multi-script Noto Sans stack. */
  fontFamily?: string;
  /** The words to lay around the ring. */
  words?: ReadonlyArray<string>;
}

/**
 * A slowly rotating ring of the word "oxide" in many languages - a circular text
 * marquee. Decorative background element (e.g. behind the cube); the words orbit
 * continuously and the ring fills seamlessly.
 *
 * The text is measured after the webfonts load: if it would be longer than the
 * circle it is scaled down to fit, then `textLength` stretches it the last little
 * bit to close the loop - so it never gaps and never overlaps (which wide CJK
 * glyphs otherwise did when the string overran the circumference).
 */
export const WordRing: React.FC<WordRingProps> = ({
  size = 600,
  duration = 40,
  reverse = false,
  color = '#61dafb',
  fontSize = 4.4,
  fontFamily = NOTO_STACK,
  words = OXIDE_TRANSLATIONS,
  style,
  ...props
}) => {
  // Unique so multiple rings don't collide on the shared <path> id.
  const pathId = `word-ring-path-${React.useId().replace(/:/g, '')}`;
  // Trailing separator too, so the wrap point (last word → first word) is spaced
  // like every other join and the ring doesn't run those two words together.
  const text = `${words.join(WORD_SEPARATOR)}${WORD_SEPARATOR}`;

  const textPathRef = React.useRef<SVGTextPathElement>(null);
  // null while measuring; the fitted font size once measured.
  const [fitFontSize, setFitFontSize] = React.useState<number | null>(null);
  const measured = fitFontSize !== null;

  // Remeasure whenever the content or requested size changes.
  useIsomorphicLayoutEffect(() => {
    setFitFontSize(null);
  }, [text, fontSize, fontFamily]);

  useIsomorphicLayoutEffect(() => {
    if (measured) return;
    let cancelled = false;
    const fit = (): void => {
      const el = textPathRef.current;
      if (cancelled || !el) return;
      // Measured without `textLength`, so this is the natural width along the path.
      const natural = el.getComputedTextLength();
      if (!natural) return;
      const maxLen = RING_CIRCUMFERENCE * RING_FILL_FRACTION;
      setFitFontSize(
        natural > maxLen ? (fontSize * maxLen) / natural : fontSize,
      );
    };
    // Wait for the webfonts so glyph widths (esp. CJK) are measured accurately.
    void (document.fonts?.ready ?? Promise.resolve()).then(fit);
    return (): void => {
      cancelled = true;
    };
  }, [measured, fontSize]);

  return (
    // `color` sets the SVG text's currentColor, so it resolves CSS variables
    // (light/dark) that a bare fill="var(...)" attribute would not.
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
      {/* The spin lives on this wrapper div (not the <svg>): a div reliably gets its
          own compositor layer, so `will-change: transform` keeps it rotating on the
          GPU thread even while the main thread is blocked (e.g. the cube's CSG build).
          Animating the <svg> directly left it main-thread-bound, so it froze. Uses the
          shared `rotate` keyframe from global.css; `--spin` carries the duration. */}
      <div
        className="size-full origin-center will-change-transform [animation:rotate_var(--spin)_linear_infinite] motion-reduce:[animation:none]"
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
          style={{ display: 'block' }}
        >
          <defs>
            <path id={pathId} d={RING_CIRCLE_PATH} fill="none" />
          </defs>
          <text
            fill="currentColor"
            fontSize={fitFontSize ?? fontSize}
            fontWeight={600}
            letterSpacing="0.5"
            // Hidden for the one measuring frame so the un-fitted layout never flashes.
            style={{
              textTransform: 'uppercase',
              fontFamily,
              visibility: measured ? 'visible' : 'hidden',
            }}
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset="0"
              // `spacing` fills by adjusting gaps only - glyphs keep their natural shape.
              {...(measured
                ? {
                    textLength: RING_CIRCUMFERENCE,
                    lengthAdjust: 'spacing' as const,
                  }
                : {})}
            >
              {text}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
};
