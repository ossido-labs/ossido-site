import type { JSX } from 'react'
import { Link, type OssidoErrorProps } from '@ossido-labs/ossido'

// The route error boundary's fallback: rendered whenever a descendant route (or a
// rejected data resource) throws. Leans on the brand's oxidation theme — the page
// "corroded" — while keeping the recovery affordances plain. `reset` re-renders the
// boundary's children so a transient failure can recover in place; the home link is
// the sure escape hatch. Deliberately shows no stack/message (the dev overlay covers
// that in development); in production those could leak internals.
export default function ErrorRoute({ reset }: OssidoErrorProps): JSX.Element {
  return (
    <div
      data-testid="error"
      role="alert"
      className="text-center h-(--full-minus-header) flex flex-col items-center justify-center px-8"
    >
      <p className="font-mono text-sm tracking-widest text-ossido-orange">4Fe + 3O₂ → 2Fe₂O₃</p>
      <h1 className="mt-3 text-4xl font-extrabold text-white">500 - This page corroded</h1>
      <p className="mt-3 font-light text-ossido-text-dim">
        A reaction went sideways and oxidised right through. Give it another shot.
      </p>
      <div className="mt-5 flex items-center gap-5">
        <button
          type="button"
          onClick={reset}
          className="font-medium text-ossido-orange hover:underline"
        >
          Try again
        </button>
        <Link href="/" className="font-medium text-ossido-text-dim hover:underline">
          Back home
        </Link>
      </div>
    </div>
  )
}
