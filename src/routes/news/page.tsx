import { ArrowRight } from '@untitledui/icons';
import { FloatyCard } from '@/components/ui/floaty-card';
import { formatDate } from '@/utils/format-date';

interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
}

// Eagerly import just the `frontmatter` export from every post (remark-mdx-frontmatter
// turns each post's `---` block into that export). New posts appear by adding a folder.
const modules = import.meta.glob<PostFrontmatter>('./*/page.mdx', {
  eager: true,
  import: 'frontmatter',
});

const posts = Object.entries(modules)
  .map(([path, frontmatter]) => ({
    href: path.replace(/^\.\/(.+)\/page\.mdx$/, '/news/$1'),
    ...frontmatter,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

const [featured, ...rest] = posts;

const NewsIndex = () => {
  return (
    <>
      <title>News</title>

      <header className="mb-10 md:mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ossido-orange">
          The Ossido blog
        </p>
        <h1 className="text-[clamp(2rem,5vw,3rem)]/[1.1] font-bold tracking-tight text-primary">
          News
        </h1>
        <p className="mt-4 max-w-2xl text-tertiary md:text-lg/relaxed">
          Release notes, deep dives into the internals, and updates from the Ossido team.
        </p>
      </header>

      {featured && (
        <FloatyCard href={featured.href} className="p-7 md:p-9">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <span className="text-ossido-orange">Latest</span>
            <span aria-hidden className="text-fg-quaternary">
              ·
            </span>
            <time dateTime={featured.date} className="text-fg-quaternary">
              {formatDate(featured.date)}
            </time>
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-primary duration-150 group-hover:text-ossido-orange md:text-3xl">
            {featured.title}
          </h2>
          <p className="mt-3 max-w-2xl text-tertiary md:text-lg/relaxed">{featured.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ossido-orange">
            Read post
            <ArrowRight className="h-4 w-4 duration-150 group-hover:translate-x-0.5" />
          </span>
        </FloatyCard>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="mb-4 mt-14 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
            More posts
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {rest.map((post) => (
              <li key={post.href}>
                <FloatyCard href={post.href} className="h-full p-6" contentClassName="flex h-full flex-col">
                  <time
                    dateTime={post.date}
                    className="text-xs font-semibold uppercase tracking-wider text-fg-quaternary"
                  >
                    {formatDate(post.date)}
                  </time>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-primary duration-150 group-hover:text-ossido-orange">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm/relaxed text-tertiary">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ossido-orange">
                    Read post
                    <ArrowRight className="h-4 w-4 duration-150 group-hover:translate-x-0.5" />
                  </span>
                </FloatyCard>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default NewsIndex;
