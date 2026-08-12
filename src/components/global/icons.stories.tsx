import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiscordIcon, ExternalIcon, GitHubIcon } from './icons';

const meta = {
  title: 'Global/Icons',
  component: GitHubIcon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GitHubIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site's custom brand/utility icons. All accept standard SVG props. */
export const AllIcons: Story = {
  render: () => (
    <div className="flex items-center gap-8 text-fg-primary">
      <div className="flex flex-col items-center gap-2">
        <GitHubIcon className="size-7" />
        <span className="text-xs text-tertiary">GitHubIcon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DiscordIcon className="size-7" />
        <span className="text-xs text-tertiary">DiscordIcon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ExternalIcon className="size-7" />
        <span className="text-xs text-tertiary">ExternalIcon</span>
      </div>
    </div>
  ),
};
