import * as React from 'react';
import { Copy01 } from '@untitledui/icons';
import { Cube, OxygenAtom } from '@/components/home-hero';
import { CUBE_RATIO, HERO_TARGET } from '@/components/home-hero/constants';
import { CodeBlock } from '@/components/ui/code-block';
import { ButtonUtility } from '@/components/ui/base/buttons/button-utility';
import { toast } from '@/components/ui/base/toast/toast';
import { PillarCards } from '@/components/home/pillar-cards';
import { FeatureSections } from '@/components/home/feature-sections';

const UNIX_INSTALL_COMMAND = 'curl -fsSL https://ossido.dev/install.sh | bash';
const WINDOWS_INSTALL_COMMAND = 'irm https://ossido.dev/install.ps1 | iex';

const IndexPage = () => {
  // State
  const [atom, setAtom] = React.useState(HERO_TARGET);
  const [isWindows, setIsWindows] = React.useState(false);

  // Computed Values
  const cube = Math.round(atom * CUBE_RATIO);
  const installCommand = isWindows ? WINDOWS_INSTALL_COMMAND : UNIX_INSTALL_COMMAND;
  const installSnippet = `# Install the Ossido CLI\n${installCommand}`;

  // Effects
  React.useEffect(() => {
    const update = (): void => {
      setAtom(Math.min(HERO_TARGET, window.innerWidth));
    };

    update();
    window.addEventListener('resize', update);
    return (): void => window.removeEventListener('resize', update);
  }, []);

  React.useEffect(() => {
    const platform = navigator.userAgent + ' ' + (navigator.platform ?? '');
    setIsWindows(/win/i.test(platform));
  }, []);

  // Handlers
  const copyInstallCommand = React.useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(installCommand);
      toast.success('Copied to clipboard', { description: installCommand });
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }, [installCommand]);

  return (
    <>
      {/* Hero — the first screen; the dot grid + cube overflow stay clipped here. */}
      <div className="relative min-h-(--full-minus-header) overflow-hidden">
        {/* Very subtle dot grid, fading out toward the bottom (see .hero-dot-grid). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-dot-grid" />
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
            <div className="relative bg-radial from-ossido-background/50 to-ossido-background/0" style={{ width: atom, height: atom }}>
              <div className="absolute inset-0 grid place-items-center">
                <OxygenAtom size={atom} />
              </div>
              <div className="absolute inset-0 grid place-items-center z-1">
                <Cube size={cube} color="#ffffff" duration={4} delay={0} />
              </div>
            </div>
            <div className="flex justify-center w-full max-w-full">
              <div className="relative overflow-hidden rounded-xl border border-secondary max-w-full bg-primary">
                <div
                  className="min-w-0 [&_pre]:pr-16!"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 4rem), transparent)',
                    maskImage: 'linear-gradient(to right, #000 calc(100% - 4rem), transparent)',
                  }}
                >
                  <CodeBlock language={isWindows ? 'powershell' : 'sh'} code={installSnippet} disableShell />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ButtonUtility
                    icon={Copy01}
                    color="tertiary"
                    tooltip="Copy command"
                    onClick={copyInstallCommand}
                  />
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
