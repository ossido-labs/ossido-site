import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen01 } from '@untitledui/icons';
import { Badge, BadgeWithDot, BadgeWithIcon } from './badges';

const COLORS = ['gray', 'brand', 'success', 'warning', 'error'] as const;

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  // Base props for the arg table; the composed stories below render their own set.
  args: { children: 'Badge', color: 'brand' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The base badge across its semantic colors. */
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <Badge key={color} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  ),
};

/** Badge with a leading status dot. */
export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <BadgeWithDot color="success">Online</BadgeWithDot>
      <BadgeWithDot color="warning">Away</BadgeWithDot>
      <BadgeWithDot color="gray">Offline</BadgeWithDot>
    </div>
  ),
};

/** Badge with a leading icon. */
export const WithIcon: Story = {
  render: () => (
    <BadgeWithIcon iconLeading={BookOpen01} color="brand">
      Docs
    </BadgeWithIcon>
  ),
};
