import type { ReactElement } from 'react';
import { Link } from '@ossido-labs/ossido';
import { ArrowRight } from '@untitledui/icons';
import { DOC_GROUPS, docGroupId, type Topic } from '@/content/docs';

const num = (i: number): string => String(i + 1).padStart(2, '0');

function TopicRow({ topic, index }: { topic: Topic; index: number }): ReactElement {
  const badge = (
    <span className="shrink-0 font-mono text-sm font-semibold text-quaternary tabular-nums">
      {num(index)}
    </span>
  );
  const body = (
    <div className="min-w-0 flex-1">
      <h3 className="text-base font-semibold tracking-tight text-primary group-hover:text-ossido-orange duration-150">
        {topic.title}
      </h3>
      <p className="mt-1 text-sm/relaxed text-tertiary">{topic.description}</p>
    </div>
  );

  if (topic.href) {
    return (
      <li>
        <Link
          href={topic.href}
          className="group flex items-start gap-4 rounded-xl border border-secondary bg-primary p-5 hover:border-primary hover:bg-primary_hover duration-150"
        >
          {badge}
          {body}
          <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-quaternary group-hover:text-ossido-orange group-hover:translate-x-0.5 duration-150" />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-start gap-4 rounded-xl border border-secondary border-dashed p-5 opacity-60">
        {badge}
        {body}
        <span className="mt-0.5 shrink-0 rounded-full border border-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-quaternary select-none">
          Soon
        </span>
      </div>
    </li>
  );
}

const DocumentationIndex = () => {
  let counter = 0;

  return (
    <>
      <h1 className="mb-3 text-[clamp(1.875rem,4vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary">
        Documentation
      </h1>
      <p className="mb-10 text-tertiary leading-relaxed text-balance">
        Everything you need to be productive with Ossido, grouped by subject and
        ordered roughly from your first day to advanced topics. More chapters are
        landing soon.
      </p>

      <div className="flex flex-col gap-10">
        {DOC_GROUPS.map((group) => (
          <section key={group.title}>
            <h2
              id={docGroupId(group.title)}
              className="mb-4 scroll-mt-20 text-xs font-semibold uppercase tracking-wider text-fg-tertiary"
            >
              {group.title}
            </h2>
            <ol className="flex flex-col gap-3">
              {group.topics.map((topic) => {
                const index = counter++;
                return <TopicRow key={topic.title} topic={topic} index={index} />;
              })}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
};

export default DocumentationIndex;
