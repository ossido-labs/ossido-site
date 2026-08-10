import { useMemo } from 'react';
import { highlighter, ossidoDark } from '@/utils/highlighter';
import { cx } from '@/utils/cx';
import { toast } from '@/components/ui/base/toast/toast';

type Language = 'sh' | 'powershell' | 'rust' | 'ts' | 'tsx' | 'css';

interface CodeBlockProps {
  language: Language;
  code: string;
  disableShell?: boolean;
}

const getLanguageColour = (language: Language) => {
  switch (language) {
    case 'sh':
      return 'text-yellow-500';
    case 'powershell':
      return 'text-blue-500';
    case 'css':
      return 'text-indigo-400';
    case 'rust':
      return 'text-ossido-orange';
    case 'ts':
    case 'tsx':
      return 'text-[#3178C6]';
  }
};

export function CodeBlock({
  code,
  language,
  disableShell = false,
}: CodeBlockProps) {
  // Computed Values
  // Highlight synchronously so the markup is server-rendered. The core
  // highlighter is fully loaded at module init (top-level await in
  // `highlighter.ts`), so `codeToHtml` runs on the server and the client alike.
  const highlightedHtml = useMemo(
    () =>
      highlighter.codeToHtml(code, {
        lang: language,
        theme: (ossidoDark as { name: string }).name,
      }),
    [code, language],
  );

  // Handlers
  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard');
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  // Renderers
  const renderCode = () => {
    return (
      <div
        className="code-block text-sm py-2 [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:scrollbar-hide [&_pre]:font-mono [&_pre]:leading-relaxed [&_pre]:py-0 [&_pre]:px-4"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    );
  };

  if (disableShell) return renderCode();

  return (
    <div className="border border-secondary rounded-lg bg-ossido-background overflow-hidden">
      <div className="border-b border-secondary flex justify-between px-4 py-2 bg-secondary/50">
        <span
          className={cx(
            'font-mono text-[10px] text-quaternary uppercase font-bold tracking-widest select-none',
            getLanguageColour(language),
          )}
        >
          {language}
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="font-mono text-[10px] text-quaternary uppercase font-bold tracking-widest select-none hover:text-primary cursor-pointer"
        >
          Copy
        </button>
      </div>
      <div className="py-1">{renderCode()}</div>
    </div>
  );
}
