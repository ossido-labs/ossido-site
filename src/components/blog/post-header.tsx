import { formatDate } from '@/utils/format-date';

interface PostHeaderProps {
  title: string;
  date: string;
}

/**
 * Title + date header for a /news post, driven by the post's frontmatter. Also
 * sets the document `<title>` (React 19 hoists it into `<head>`).
 */
export function PostHeader({ title, date }: PostHeaderProps) {
  return (
    <header className="mb-8 border-b border-secondary pb-6">
      <title>{title}</title>
      <time dateTime={date} className="text-sm text-fg-quaternary">
        {formatDate(date)}
      </time>
      <h1 className="mt-2 text-[clamp(1.875rem,4vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary">
        {title}
      </h1>
    </header>
  );
}
