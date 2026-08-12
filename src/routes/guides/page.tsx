import type { ReactElement } from 'react';
import { Link } from '@ossido-labs/ossido';
import { ArrowRight } from '@untitledui/icons';
import { GUIDE_GROUPS, guideGroupId, type Guide } from '@/content/guides';

function Meta({ guide }: { guide: Guide }): ReactElement {
  return (
    <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-fg-quaternary">
      {guide.level && <span>{guide.level}</span>}
      {guide.level && guide.minutes && <span aria-hidden>·</span>}
      {guide.minutes && <span>~{guide.minutes} min</span>}
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }): ReactElement {
  const body = (
    <div className="min-w-0 flex-1">
      <h3 className="text-base font-semibold tracking-tight text-primary group-hover:text-ossido-orange duration-150">
        {guide.title}
      </h3>
      <p className="mt-1 text-sm/relaxed text-tertiary">{guide.description}</p>
      <Meta guide={guide} />
    </div>
  );

  if (guide.href) {
    return (
      <li>
        <Link
          href={guide.href}
          className="group flex items-start gap-4 rounded-xl border border-secondary bg-primary p-5 hover:border-primary hover:bg-primary_hover duration-150"
        >
          {body}
          <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-quaternary group-hover:text-ossido-orange group-hover:translate-x-0.5 duration-150" />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-start gap-4 rounded-xl border border-secondary border-dashed p-5 opacity-60">
        {body}
        <span className="mt-0.5 shrink-0 rounded-full border border-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-quaternary select-none">
          Soon
        </span>
      </div>
    </li>
  );
}

const GuidesIndex = () => {
  return (
    <>
      <h1 className="mb-3 text-[clamp(1.875rem,4vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary">
        Guides
      </h1>
      <p className="mb-10 text-tertiary leading-relaxed text-balance">
        Task-oriented, end-to-end walkthroughs for building with Ossido - from
        your first app to shipping it. For reference material on how each piece
        works, see the{' '}
        <Link
          href="/documentation"
          className="font-medium text-ossido-orange underline-offset-4 hover:underline"
        >
          Documentation
        </Link>
        .
      </p>

      <div className="flex flex-col gap-10">
        {GUIDE_GROUPS.map((group) => (
          <section key={group.title}>
            <h2
              id={guideGroupId(group.title)}
              className="mb-4 scroll-mt-20 text-xs font-semibold uppercase tracking-wider text-fg-tertiary"
            >
              {group.title}
            </h2>
            <ol className="flex flex-col gap-3">
              {group.guides.map((guide) => (
                <GuideCard key={guide.title} guide={guide} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
};

export default GuidesIndex;
