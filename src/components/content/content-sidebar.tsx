import { Link, useRouter } from '@ossido-labs/ossido';
import { cx } from '@/utils/cx';

export interface SidebarItem {
  title: string;
  href?: string;
}

export interface SidebarGroup {
  title: string;
  items: Array<SidebarItem>;
}

interface ContentSidebarProps {
  groups: Array<SidebarGroup>;
  ariaLabel: string;
}

/** Left rail shared by Documentation and Guides: subject-grouped links with the
 * current page highlighted. Items without an `href` render dimmed as "Soon". */
export function ContentSidebar({ groups, ariaLabel }: ContentSidebarProps) {
  const { pathname } = useRouter();

  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-6 text-sm">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              if (!item.href) {
                return (
                  <li key={item.title}>
                    <span className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-fg-quaternary/45 select-none cursor-default">
                      <span className="truncate">{item.title}</span>
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-widest">
                        Soon
                      </span>
                    </span>
                  </li>
                );
              }

              const active = pathname === item.href;
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'block rounded-md px-3 py-1.5 duration-150',
                      active
                        ? 'bg-primary_hover font-medium text-fg-primary'
                        : 'text-fg-quaternary hover:bg-primary_hover hover:text-fg-primary',
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
