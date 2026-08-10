import * as React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Stats, useKTX2 } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  BAKED_GEOMETRY_URL,
  deserializeBaseGeometry,
  hydrateEngravedGeometry,
} from './cube-geometry';
import {
  BUMP_STRENGTH,
  EMISSIVE_INTENSITY,
  ENGRAVE_START,
  FOLLOW_AMPLITUDE,
  GLOW_FADE,
  GLOW_START,
  ISO_X,
  ISO_Y,
  LIGHT_FILL,
  LIGHT_KEY,
  STEP_DURATION,
  STEP_INTERVAL,
  KTX2_TRANSCODER_PATH,
  TEXTURE_REPEAT,
  TEXTURES,
  ZOOM_DIVISOR,
} from './constants';

/**
 * Aggressive ease-out (quintic): near-instant launch that decelerates hard into
 * the resting angle. A higher exponent = a snappier, more abrupt settle than
 * plain cubic.
 */
const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/** The cube's own face axes; the tumble turns 90° about the next one each step. */
const STEP_AXES = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

/** Symmetric accelerate/decelerate for each quarter-turn. */
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** The settled isometric orientation as a quaternion — the base the tumble builds on. */
const REST_QUAT = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(ISO_X, ISO_Y, 0),
);

// Module-cached engraved geometry — identical for every cube, so it's built once
// and shared. The heavy boolean cut is baked (see scripts/bake-cube.ts); here we
// just load that binary and add the cheap per-vertex passes.
let engravedGeometry: THREE.BufferGeometry | null = null;
let engravedPromise: Promise<THREE.BufferGeometry> | null = null;

async function loadEngravedGeometry(): Promise<THREE.BufferGeometry> {
  if (engravedGeometry) return engravedGeometry;
  if (!engravedPromise) {
    engravedPromise = (async (): Promise<THREE.BufferGeometry> => {
      let base: THREE.BufferGeometry;
      try {
        const res = await fetch(BAKED_GEOMETRY_URL);
        if (!res.ok) throw new Error(`baked geometry ${res.status}`);
        base = deserializeBaseGeometry(await res.arrayBuffer());
      } catch {
        // Fallback: cut it live. The dynamic import keeps three-bvh-csg out of the
        // main bundle — it only loads if the baked file is missing.
        const build = await import('./cube-geometry.build');
        base = await build.buildEngravedBaseLive();
      }
      engravedGeometry = hydrateEngravedGeometry(base);
      return engravedGeometry;
    })();
  }
  return engravedPromise;
}

/** Load the module-cached engraved geometry; null until ready. */
function useEngravedGeometry(): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = React.useState<THREE.BufferGeometry | null>(
    engravedGeometry,
  );

  React.useEffect(() => {
    let cancelled = false;
    loadEngravedGeometry()
      .then((g) => {
        if (!cancelled) setGeometry(g);
      })
      .catch(() => {
        /* If even the fallback fails, the cube simply never renders. */
      });
    return (): void => {
      cancelled = true;
    };
  }, []);

  return geometry;
}

/** Track the user's reduced-motion preference, reacting to live changes. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent): void =>
      setReduced(event.matches);
    query.addEventListener('change', onChange);
    return (): void => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Coarse-pointer (touch / handheld) detection, captured once at mount via the lazy
 * state initialiser so the render pipeline can be sized for the device from the very
 * first frame — no post-mount prop churn that would rebuild shadow maps or the
 * effect composer. Handhelds are fill-rate bound, so they get a lighter pipeline.
 */
function useCoarsePointer(): boolean {
  return React.useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches,
  )[0];
}

interface SpinningCubeProps {
  color: string;
  duration: number;
  delay: number;
  /** Coarse pointer (handheld): drive the follow from device tilt, not the mouse. */
  coarse: boolean;
  /** Fired once the textures + geometry are ready and the cube first renders. */
  onReady: () => void;
}

/** The mesh itself: cuts the engraved geometry and drives the spin via `useFrame`. */
const SpinningCube: React.FC<SpinningCubeProps> = ({
  color,
  duration,
  delay,
  coarse,
  onReady,
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const elapsed = React.useRef(0);
  // Smoothed pointer-follow offset (radians), damped toward the target each frame.
  const follow = React.useRef({ x: 0, y: 0 });
  // Pointer position tracked across the whole document (normalised to -1..1),
  // so the cube reacts to the mouse anywhere on the page — not only when the
  // cursor is over its small canvas.
  const pointer = React.useRef({ x: 0, y: 0 });
  // Periodic-tumble state: `settled` is the orientation held between turns; while
  // `animating`, the pose slerps `from` → `to` over `t` (0..1). `sinceStep` counts
  // idle seconds toward the next turn, `axis` selects which world axis is next.
  const spin = React.useRef({
    settled: new THREE.Quaternion().copy(REST_QUAT),
    from: new THREE.Quaternion(),
    to: new THREE.Quaternion(),
    animating: false,
    t: 0,
    sinceStep: 0,
    axis: 0,
  });
  // Scratch objects reused each frame to avoid per-frame allocations.
  const scratch = React.useRef({
    base: new THREE.Quaternion(),
    tilt: new THREE.Quaternion(),
    step: new THREE.Quaternion(),
    euler: new THREE.Euler(),
  });
  // Emissive glow ramp (0 → 1) that powers on only after the spin-in settles, plus
  // a handle to the shader uniform it drives.
  const glow = React.useRef(0);
  const glowUniform = React.useRef<{ value: number } | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Suspends until every map is transcoded + uploaded, so the spin-in only begins
  // once the textures are ready to show. KTX2 keeps them GPU-compressed in VRAM
  // (see constants.ts); the transcoder decodes to the device's supported format.
  const { map, normalMap, roughnessMap, metalnessMap, aoMap } =
    useKTX2(TEXTURES, KTX2_TRANSCODER_PATH);
  const geometry = useEngravedGeometry();

  // Drive the pointer-follow from device tilt on handhelds (which have an
  // accelerometer but no mouse), falling back to mouse position on desktop. Tilt
  // maps the phone's lean into the same -1..1 space the follow expects: the first
  // reading is captured as the neutral rest angle, so whatever way the device is
  // held becomes centre and only *changes* in tilt nudge the cube.
  React.useEffect(() => {
    // A coarse pointer + a DeviceOrientation API is our proxy for "has an
    // accelerometer, no mouse". Desktops with a touchscreen still report a fine
    // pointer, so they keep the mouse path.
    const useTilt = coarse && 'DeviceOrientationEvent' in window;

    if (!useTilt) {
      const onMove = (event: MouseEvent): void => {
        pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      };
      document.addEventListener('mousemove', onMove);
      return (): void => document.removeEventListener('mousemove', onMove);
    }

    // Degrees of tilt away from the neutral pose that map to the full follow range.
    const TILT_RANGE = 30;
    let neutral: { beta: number; gamma: number } | null = null;
    const onTilt = (event: DeviceOrientationEvent): void => {
      const { beta, gamma } = event; // front/back and left/right tilt, in degrees
      if (beta === null || gamma === null) return;
      neutral ??= { beta, gamma };
      // gamma (left/right lean) → horizontal follow; beta (front/back) → vertical,
      // negated so tilting the top away pushes the cube's top back like the mouse.
      pointer.current.x = THREE.MathUtils.clamp(
        (gamma - neutral.gamma) / TILT_RANGE,
        -1,
        1,
      );
      pointer.current.y = THREE.MathUtils.clamp(
        -(beta - neutral.beta) / TILT_RANGE,
        -1,
        1,
      );
    };

    const listen = (): void =>
      window.addEventListener('deviceorientation', onTilt);

    // iOS 13+ gates motion/orientation behind a permission request that must be
    // triggered by a user gesture; elsewhere the events just flow. Request on the
    // first touch, then start listening if granted.
    const requestPermission = (
      window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      }
    ).requestPermission;
    let onGesture: (() => void) | null = null;
    if (typeof requestPermission === 'function') {
      onGesture = (): void => {
        requestPermission()
          .then((state) => {
            if (state === 'granted') listen();
          })
          .catch(() => {
            /* Permission denied or unavailable: the cube simply won't tilt-follow. */
          });
      };
      window.addEventListener('touchend', onGesture, { once: true });
    } else {
      listen();
    }

    return (): void => {
      window.removeEventListener('deviceorientation', onTilt);
      if (onGesture) window.removeEventListener('touchend', onGesture);
    };
  }, [coarse]);

  // Configure the maps: sRGB for albedo, and a shared repeat so the detail sits
  // larger on each face. Max anisotropy keeps the surface crisp on the steeply
  // foreshortened faces (esp. the top), which otherwise mip-blur into a smeared,
  // "stretched" look at this isometric grazing angle.
  const maxAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );
  React.useMemo(() => {
    for (const tex of [map, normalMap, roughnessMap, metalnessMap, aoMap]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
      tex.anisotropy = maxAnisotropy;
      tex.needsUpdate = true;
    }
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, normalMap, roughnessMap, metalnessMap, aoMap, maxAnisotropy]);

  // One material for the whole surface — outer faces and recess interiors alike
  // (the geometry's box-projected UVs keep the mapping continuous).
  const material = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        map,
        normalMap,
        normalScale: new THREE.Vector2(BUMP_STRENGTH, BUMP_STRENGTH),
        roughnessMap,
        metalnessMap,
        aoMap,
        aoMapIntensity: 1,
        metalness: 1,
        roughness: 1,
        // The roughness map doubles as the emissive map, so the glow *emits from*
        // the obsidian's shard texture (bright facets, dark crevices) rather than
        // reading as a flat fill; the colour comes from the per-vertex attribute.
        emissiveMap: roughnessMap,
      }),
    [map, normalMap, roughnessMap, metalnessMap, aoMap, color],
  );

  // Drive the emissive from the per-vertex recess colour (black on the outer
  // faces → glow only inside the engravings, tinted per symbol). A tiny shader
  // patch carries the colour as a varying and swaps it in for the standard
  // emissive; `uEmissiveIntensity` scales it (still multiplied by the emissive map).
  React.useEffect(() => {
    material.onBeforeCompile = (shader): void => {
      // Starts dark; `useFrame` ramps it up once the intro animation finishes.
      shader.uniforms.uEmissiveIntensity = { value: 0 };
      glowUniform.current = shader.uniforms.uEmissiveIntensity;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute vec3 aEmissive;\nvarying vec3 vEmissive;',
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvEmissive = aEmissive;',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vEmissive;\nuniform float uEmissiveIntensity;',
        )
        .replace(
          'vec3 totalEmissiveRadiance = emissive;',
          'vec3 totalEmissiveRadiance = vEmissive * uEmissiveIntensity;',
        );
    };
    material.needsUpdate = true;
  }, [material]);

  React.useEffect(() => {
    return (): void => material.dispose();
  }, [material]);

  // Signal readiness once the geometry exists (textures already resolved via
  // Suspense), so the parent can start the whole-composition fade in sync.
  React.useEffect(() => {
    if (geometry) onReady();
  }, [geometry, onReady]);

  // R3F assigns the geometry by prop after the mesh is constructed, so three's
  // one-time morph setup never runs — leaving `morphTargetInfluences` undefined
  // and crashing the shadow pass. Initialise it here (seeded fully sealed) the
  // moment the mesh mounts, while still exposing the node through `meshRef`.
  const attachMesh = React.useCallback((node: THREE.Mesh | null): void => {
    meshRef.current = node;
    if (node?.geometry.morphAttributes.position) {
      node.updateMorphTargets();
      if (node.morphTargetInfluences) node.morphTargetInfluences[0] = 1;
    }
  }, []);

  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Clamp the frame delta: a slow first frame (texture/CSG load gap) would
    // otherwise jump `elapsed` past the whole intro, skipping the spin-in and
    // popping the glow on immediately.
    const delta = Math.min(rawDelta, 1 / 30);

    // Reduced motion: no spin, no pointer follow — just the settled iso cube,
    // engravings fully carved in and glowing.
    if (reducedMotion) {
      mesh.rotation.set(ISO_X, ISO_Y, 0);
      mesh.scale.setScalar(1);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = 0;
      if (glowUniform.current) glowUniform.current.value = EMISSIVE_INTENSITY;
      return;
    }

    elapsed.current += delta;
    const progress = clamp01((elapsed.current - delay) / duration);
    const eased = easeOutQuint(progress);

    // Ease the pointer-follow in as the cube settles, then damp toward it so the
    // motion is smooth and lagging rather than instantaneous — enough to catch
    // the specular highlight sliding across the metal.
    const targetX = pointer.current.y * FOLLOW_AMPLITUDE * eased;
    const targetY = pointer.current.x * FOLLOW_AMPLITUDE * eased;
    follow.current.x = THREE.MathUtils.damp(
      follow.current.x,
      targetX,
      5,
      delta,
    );
    follow.current.y = THREE.MathUtils.damp(
      follow.current.y,
      targetY,
      5,
      delta,
    );

    const s = spin.current;
    const k = scratch.current;

    if (progress < 1) {
      // Spin-in: a full extra turn about Y easing into the iso rest. Keep the
      // tumble primed to begin from the rest pose the moment we settle.
      const spinY = THREE.MathUtils.lerp(ISO_Y - Math.PI * 2, ISO_Y, eased);
      k.base.setFromEuler(k.euler.set(ISO_X, spinY, 0));
      s.settled.copy(REST_QUAT);
      s.animating = false;
      s.sinceStep = 0;
      s.axis = 0;
      // A touch of scale-up reads as the cube arriving toward the viewer.
      mesh.scale.setScalar(THREE.MathUtils.lerp(0.82, 1, eased));
    } else if (s.animating) {
      // Mid quarter-turn: slerp from the held pose to the turned pose.
      s.t = clamp01(s.t + delta / STEP_DURATION);
      k.base.slerpQuaternions(s.from, s.to, easeInOutCubic(s.t));
      if (s.t >= 1) {
        s.settled.copy(s.to);
        s.animating = false;
        s.sinceStep = 0;
      }
      mesh.scale.setScalar(1);
    } else {
      // Settled and holding; after STEP_INTERVAL, start a 90° turn about the next axis.
      k.base.copy(s.settled);
      s.sinceStep += delta;
      if (s.sinceStep >= STEP_INTERVAL) {
        k.step.setFromAxisAngle(
          STEP_AXES[s.axis % STEP_AXES.length],
          Math.PI / 2,
        );
        s.axis += 1;
        s.from.copy(s.settled);
        s.to.copy(s.settled).multiply(k.step); // local face-axis quarter-turn (stays iso)
        s.t = 0;
        s.animating = true;
      }
      mesh.scale.setScalar(1);
    }

    // Lay the (world-space) pointer tilt over whatever the base pose is.
    k.tilt.setFromEuler(k.euler.set(-follow.current.x, follow.current.y, 0));
    mesh.quaternion.copy(k.tilt).multiply(k.base);

    // Carve the engravings in over the tail of the settle: influence 1 (sealed)
    // → 0 (fully recessed) across the last (1 − ENGRAVE_START) of the spin.
    if (mesh.morphTargetInfluences) {
      const engraveIn = clamp01((eased - ENGRAVE_START) / (1 - ENGRAVE_START));
      mesh.morphTargetInfluences[0] = 1 - engraveIn;
    }

    // Ease the glow up once the spin-in passes GLOW_START, over GLOW_FADE seconds,
    // so the engravings light up gradually as the cube settles.
    if (glowUniform.current) {
      glow.current = clamp01(
        glow.current + (progress >= GLOW_START ? delta / GLOW_FADE : 0),
      );
      glowUniform.current.value =
        EMISSIVE_INTENSITY * easeInOutCubic(glow.current);
    }
  });

  // Nothing to draw until the cutters have loaded and the geometry is cut.
  if (!geometry) return null;

  // Casts and receives its own shadows so the recess walls shade their floors.
  return (
    <mesh
      ref={attachMesh}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
};

export interface CubeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color'
> {
  /** Rendered width and height of the canvas, in pixels. */
  size?: number;
  /** Tint multiplied over the metal albedo map. White shows the texture as-is. */
  color?: string;
  /** Length of the spin-in, in seconds. */
  duration?: number;
  /** Delay before the spin-in begins, in seconds. */
  delay?: number;
}

/**
 * Keep the orthographic zoom (pixels-per-world-unit) locked to the live canvas
 * width, so the cube scales in ratio when `size` changes (e.g. the responsive
 * layout resizing). The `camera` prop only seeds the zoom at mount — R3F doesn't
 * re-apply it on prop changes — so without this a resize left the cube's zoom stale.
 */
const ZoomToCanvas: React.FC = () => {
  const camera = useThree((s) => s.camera as THREE.OrthographicCamera);
  const width = useThree((s) => s.size.width);
  React.useLayoutEffect(() => {
    camera.zoom = width / ZOOM_DIVISOR;
    camera.updateProjectionMatrix();
  }, [camera, width]);
  return null;
};

/** Show the drei FPS/ms panel when the URL carries `?stats` — a zero-config way to
 * read real numbers on-device (e.g. iOS Safari) without a build change. */
const SHOW_STATS =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('stats');

interface CubeSceneProps {
  color: string;
  duration: number;
  delay: number;
  coarse: boolean;
  onReady: () => void;
}

/** The scene graph rendered inside the <Canvas> (see {@link Cube}). */
const CubeScene: React.FC<CubeSceneProps> = ({
  color,
  duration,
  delay,
  coarse,
  onReady,
}) => {
  // Shadows are re-rendered every frame (the cube spins), so their map is a large
  // per-frame fill cost. 2048² was vast overkill for a ~500px cube; 1024 is already
  // crisp at this size, and handhelds drop to 512 where fill rate is scarcest.
  const shadowSize = coarse ? 512 : 1024;
  return (
    <>
      <ZoomToCanvas />
      {SHOW_STATS && <Stats />}
      {/* Low ambient keeps the scene dark and moody; the metal's brightness
        comes mostly from reflected highlights, not flat fill. */}
      <ambientLight intensity={0.22} color={LIGHT_KEY} />
      {/* Key light: the crisp specular glint (slides as the cube tracks the
        pointer) plus the real shadows in the recesses. */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.9}
        color={LIGHT_KEY}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-near={0.1}
        shadow-camera-far={40}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={[-6, -3, -4]}
        intensity={0.15}
        color={LIGHT_FILL}
      />
      {/* A dark studio environment (baked once, procedural — no network fetch)
        so the metal reflects something: mostly black for mood, with a couple
        of bright panels that read as shine sweeping across the surface. */}
      {/* A dark studio environment (baked once, procedural — no network fetch)
        so the metal reflects something: mostly black for mood, with a couple
        of bright panels that read as shine sweeping across the surface. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#050507']} />
        <Lightformer
          form="rect"
          intensity={3.5}
          color="#ffffff"
          position={[4, 4, 3]}
          scale={[0.7, 6, 1]}
          rotation={[0, -0.5, 0.15]}
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          color="#9fb4d0"
          position={[-5, 2, 1]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#ffd8b0"
          position={[0, -4, -3]}
          scale={[6, 3, 1]}
        />
      </Environment>
      <React.Suspense fallback={null}>
        <SpinningCube
          color={color}
          duration={duration}
          delay={delay}
          coarse={coarse}
          onReady={onReady}
        />
      </React.Suspense>
      {/* SMAA (a cheap post-process AA pass) runs on every device — it's what keeps
        the cube's edges and engravings crisp. The expensive bit skipped on handhelds
        is the MSAA-multisampled HDR target (`multisampling={0}`); desktop keeps the
        default 8×. Bloom is on everywhere: only the emissive engravings clear its
        threshold (the obsidian is near-black), so the glow blooms while the surface
        stays crisp. */}
      <EffectComposer multisampling={coarse ? 0 : 8}>
        <Bloom
          mipmapBlur
          intensity={0.4}
          radius={0.4}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.2}
        />
        <SMAA />
      </EffectComposer>
    </>
  );
};

/**
 * A Three.js cube (via react-three-fiber) dressed in the corroded-metal PBR
 * texture set, with the React, Rust and thunderbolt symbols cut as real vector
 * recesses into its three visible faces. The opaque cube spins in and settles at
 * an isometric angle (then drifts slightly toward the pointer), while the whole
 * composition fades in as one — a CSS opacity transition on the container, not the
 * 3D materials, so faces never turn individually translucent. Rendered under an
 * orthographic camera for a true isometric projection, with an SMAA pass.
 *
 * The <Canvas> owns the WebGL context on the normal React lifecycle: it's created
 * on mount and destroyed on unmount. A remount therefore builds a fresh scene
 * graph — `SpinningCube`'s animation state starts from zero — so the spin-in,
 * carve-in, glow ramp and fade all replay every time.
 */
export default function Cube({
  size = 600,
  color = '#ffffff',
  duration = 2.8,
  delay = 0,
  style,
  ...props
}: CubeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const [ready, setReady] = React.useState(false);
  const handleReady = React.useCallback(() => setReady(true), []);

  // Pause the render loop while the cube is scrolled out of view: the tumble spins
  // on forever, so without this it keeps burning GPU/battery behind the rest of the
  // page. `frameloop="never"` halts rendering entirely; it resumes seamlessly since
  // the per-frame delta is clamped, so the long paused gap doesn't skip the intro.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = React.useState(true);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      {
        // A little margin so it wakes just before scrolling back into view.
        rootMargin: '100px',
      },
    );
    observer.observe(el);
    return (): void => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        // Fade the whole rendered image in as one, once the cube is ready. This
        // easing curve mirrors the spin-in's `easeOutQuint`.
        opacity: reducedMotion || ready ? 1 : 0,
        transition: reducedMotion
          ? undefined
          : `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        ...style,
      }}
      {...props}
    >
      {/* zoom is pixels-per-world-unit; sized so the ~3.46-unit diagonal of the
          rotating cube fits the canvas with margin at any `size`. dpr is capped at 2
          on every device — on a 3× iPhone that's near-native yet ~55% fewer fragments
          than dpr 3, and it's what kept the original looking crisp. Going lower than
          this visibly under-samples the engravings, so perf is won elsewhere (shadows,
          MSAA, off-screen pause), not by dropping resolution. `antialias` is off
          because the effect composer owns AA via the SMAA pass. */}
      <Canvas
        orthographic
        shadows
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
          precision: 'mediump',
        }}
        camera={{
          position: [0, 0, 10],
          zoom: size / ZOOM_DIVISOR,
          near: 0.1,
          far: 100,
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CubeScene
          color={color}
          duration={duration}
          delay={delay}
          coarse={coarse}
          onReady={handleReady}
        />
      </Canvas>
    </div>
  );
}
