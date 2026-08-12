import { Link01 } from '@untitledui/icons';

/**
 * The hover-reveal anchor link shown to the right of a heading. Render it inside a
 * heading that has the `group` class and a matching `id`, so hovering (or keyboard
 * focus) exposes a `#id` deep-link to that section. Shared by the MDX heading
 * renderer (docs, blog) and the API Reference section headings.
 */
export function HeadingAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="ml-2 inline-flex translate-y-[0.05em] text-quaternary opacity-0 transition-opacity hover:text-ossido-orange focus-visible:opacity-100 group-hover:opacity-100"
    >
      <Link01 className="size-[0.8em]" aria-hidden />
    </a>
  );
}
