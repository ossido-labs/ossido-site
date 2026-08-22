import * as React from 'react';
import { Copy01 } from '@untitledui/icons';
import { Cube, OxygenAtom } from '@/components/home-hero';
import { CUBE_RATIO, HERO_TARGET } from '@/components/home-hero/constants';
import { CodeBlock } from '@/components/ui/code-block';
import { ButtonUtility } from '@/components/ui/base/buttons/button-utility';
import { toast } from '@/components/ui/base/toast/toast';
import { PillarCards } from '@/components/home/pillar-cards';
import { FeatureSections } from '@/components/home/feature-sections';
import { cx } from '@/utils/cx';

// Scaffold commands per JS package manager, shown as tabs in the hero.
const CREATE_COMMANDS = [
  { id: 'bun', command: 'bun create ossido my-app' },
  { id: 'npm', command: 'npm create ossido@latest my-app' },
  { id: 'pnpm', command: 'pnpm create ossido my-app' },
  { id: 'yarn', command: 'yarn create ossido my-app' },
] as const;

type PackageManager = (typeof CREATE_COMMANDS)[number]['id'];

const IndexPage = () => {
  // State
  const [atom, setAtom] = React.useState(HERO_TARGET);
  const [pm, setPm] = React.useState<PackageManager>('bun');

  // Computed Values
  const cube = Math.round(atom * CUBE_RATIO);
  const command =
    CREATE_COMMANDS.find((c) => c.id === pm)?.command ??
    CREATE_COMMANDS[0].command;

  // Effects
  React.useEffect(() => {
    const update = (): void => {
      setAtom(Math.min(HERO_TARGET, window.innerWidth));
    };

    update();
    window.addEventListener('resize', update);
    return (): void => window.removeEventListener('resize', update);
  }, []);

  // Handlers
  const copyCommand = React.useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(command);
      toast.success('Copied to clipboard', { description: command });
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }, [command]);

  return (
    <>
      {/* Hero - the first screen; the dot grid + cube overflow stay clipped here. */}
      <div className="relative min-h-(--full-minus-header) overflow-hidden">
        {/* Very subtle dot grid, fading out toward the bottom (see .hero-dot-grid). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hero-dot-grid"
        />
        <div className="relative min-h-(--full-minus-header) flex flex-col items-center justify-center max-w-350 mx-auto">
          <div className="flex items-center justify-center grow flex-col gap-8 w-full p-8 md:pt-12 lg:pt-14 xl:pt-16">
            <div className="flex flex-col justify-center items-center text-center gap-4">
              <h1 className="text-[clamp(2.5rem,5vw,3rem)]/[1.1] font-bold tracking-tight">
                <span className="text-ossido-orange">Rust</span> powered{' '}
                <span className="text-ossido-cyan">React</span> framework
              </h1>
              <h2 className="text-[clamp(1.125rem,2.75vw,1.875rem)]/snug text-fg-tertiary tracking-tight">
                Axum powered React server-side rendering
              </h2>
            </div>
            <div
              className="relative bg-radial from-ossido-background/50 to-ossido-background/0"
              style={{ width: atom, height: atom }}
            >
              <div className="absolute inset-0 grid place-items-center">
                <OxygenAtom size={atom} />
              </div>
              <div className="absolute inset-0 grid place-items-center z-1">
                <Cube size={cube} color="#ffffff" duration={4} delay={0} />
              </div>
            </div>
            <div className="flex justify-center w-full max-w-full">
              <div className="overflow-hidden rounded-xl border border-secondary max-w-full bg-primary">
                {/* Package-manager tabs - pick the create command to run. */}
                <div className="flex items-center justify-center gap-1 border-b border-secondary px-2 py-1.5">
                  {CREATE_COMMANDS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={pm === c.id}
                      onClick={() => setPm(c.id)}
                      className={cx(
                        'rounded-md px-2.5 py-1 font-mono text-xs duration-150',
                        pm === c.id
                          ? 'bg-primary_hover text-fg-primary'
                          : 'text-fg-quaternary hover:text-fg-primary',
                      )}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
                {/* Active command + copy. */}
                <div className="relative">
                  <div
                    className="min-w-0 [&_pre]:pr-16!"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(to right, #000 calc(100% - 4rem), transparent)',
                      maskImage:
                        'linear-gradient(to right, #000 calc(100% - 4rem), transparent)',
                    }}
                  >
                    <CodeBlock language="sh" code={command} disableShell />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ButtonUtility
                      icon={Copy01}
                      color="tertiary"
                      tooltip="Copy command"
                      onClick={copyCommand}
                    />
                  </div>
                </div>
              </div>
            </div>
            <PillarCards />
          </div>
        </div>
      </div>

      {/* Dedicated subject sections below the hero. */}
      <FeatureSections />
    </>
  );
};

export default IndexPage;
