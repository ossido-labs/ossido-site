import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentSidebar, type SidebarGroup } from './content-sidebar';

const GROUPS: Array<SidebarGroup> = [
  {
    title: 'Getting started',
    items: [
      { title: 'Mental model', href: '/documentation/mental-model' },
      { title: 'Installation', href: '/documentation/installation' },
      { title: 'The CLI', href: '/documentation/cli' },
      { title: 'Configuration', href: '/documentation/configuration' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { title: 'Handlers', href: '/documentation/rust-backend' },
      { title: 'API Handlers', href: '/documentation/api-handlers' },
      { title: 'Middleware', href: '/documentation/middleware' },
      // No href -> renders dimmed as "Soon".
      { title: 'Background jobs' },
    ],
  },
];

const meta = {
  title: 'Navigation/ContentSidebar',
  component: ContentSidebar,
  tags: ['autodocs'],
  args: { groups: GROUPS, ariaLabel: 'Documentation' },
} satisfies Meta<typeof ContentSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grouped navigation links. Items without an href render as dimmed "Soon" entries. */
export const Default: Story = {};

/** With the mock route set to a link's href, that item is highlighted as current. */
export const ActiveItem: Story = {
  parameters: { route: '/documentation/installation' },
};
