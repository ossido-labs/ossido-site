import * as React from 'react';

import {
  ATOM_ENTER_STAGGER,
  ATOM_INNER_SHELL_RATIO,
  ATOM_INNER_WORD_RATIO,
  ATOM_OUTER_SHELL_RATIO,
  ATOM_OUTER_WORD_RATIO,
  ATOM_RING_COLOR,
  OXIDE_TRANSLATIONS_INNER,
  RING_ENTER,
} from './constants';
import { ElectronShell } from './ElectronShell';
import { WordRing } from './WordRing';

export interface OxygenAtomProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter of the outermost ring (the 6-electron shell), in px. */
  size?: number;
  /** Colour for every ring - the electrons and text share it. */
  color?: string;
  /** Seconds before the innermost ring enters; the rest cascade outward. */
  enterDelay?: number;
}

/**
 * The full oxide/oxygen motif: the two "oxide" word rings and oxygen's two electron
 * shells (2 + 6), interleaved by radius so they alternate outward -
 *   inner word → inner electron shell → outer word → outer electron shell.
 * Each ring is sized from the shared `size` (its text/orbit radius back-computed to
 * sit at an even step), and they fade + scale in one after another from the centre.
 */
export const OxygenAtom: React.FC<OxygenAtomProps> = ({
  size = 900,
  color = ATOM_RING_COLOR,
  enterDelay = 1.6,
  style,
  ...props
}) => {
  const innerWord = size * ATOM_INNER_WORD_RATIO;
  const innerShell = size * ATOM_INNER_SHELL_RATIO;
  const outerWord = size * ATOM_OUTER_WORD_RATIO;
  const outerShell = size * ATOM_OUTER_SHELL_RATIO;

  const wrap = (px: number, delay: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    margin: 'auto',
    width: px,
    height: px,
    animationDelay: `${delay}s`,
  });

  return (
    <div
      style={{ position: 'relative', width: size, height: size, ...style }}
      {...props}
    >
      <div
        className={`origin-center ${RING_ENTER}`}
        style={wrap(innerWord, enterDelay)}
      >
        <WordRing
          size={innerWord}
          reverse
          duration={45}
          fontSize={5.4}
          color={color}
          words={OXIDE_TRANSLATIONS_INNER}
          style={{ opacity: 0.42 }}
        />
      </div>
      <div
        className={`origin-center ${RING_ENTER}`}
        style={wrap(innerShell, enterDelay + ATOM_ENTER_STAGGER)}
      >
        {/* 2-electron shell, offset 90° so they don't line up with the outer shell's. */}
        <ElectronShell
          size={innerShell}
          electrons={2}
          duration={12}
          startAngle={Math.PI / 2}
          color={color}
        />
      </div>
      <div
        className={`origin-center ${RING_ENTER}`}
        style={wrap(outerWord, enterDelay + ATOM_ENTER_STAGGER * 2)}
      >
        <WordRing
          size={outerWord}
          duration={67}
          fontSize={4.1}
          color={color}
          style={{ opacity: 0.55 }}
        />
      </div>
      <div
        className={`origin-center ${RING_ENTER}`}
        style={wrap(outerShell, enterDelay + ATOM_ENTER_STAGGER * 3)}
      >
        <ElectronShell
          size={outerShell}
          electrons={6}
          duration={17}
          reverse
          color={color}
        />
      </div>
    </div>
  );
};
