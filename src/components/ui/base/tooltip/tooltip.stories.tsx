import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, TooltipTrigger } from './tooltip';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'Copied to clipboard',
    children: (
      <TooltipTrigger>
        <button
          type="button"
          className="rounded-md border border-secondary px-3 py-1.5 text-sm text-fg-primary"
        >
          Hover me
        </button>
      </TooltipTrigger>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover (or focus) the trigger to reveal the tooltip. */
export const Default: Story = {};

export const WithDescriptionAndArrow: Story = {
  args: {
    title: 'Keyboard shortcut',
    description: 'Press Cmd + K to search.',
    arrow: true,
  },
};
