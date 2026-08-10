import { ArrowRight, Download01, Plus, Trash01 } from '@untitledui/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/base/buttons/button';

const COLORS = [
  'primary',
  'accent',
  'secondary',
  'tertiary',
  'link-color',
  'link-gray',
  'primary-destructive',
  'secondary-destructive',
  'tertiary-destructive',
  'link-destructive',
] as const;

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Base/Button',
  component: Button,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  // The app is dark-mode only; render every story on the app's dark surface.
  decorators: [
    (Story): ReactElement => (
      <div className="dark-mode bg-ossido-background min-h-svh p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: { control: 'select', options: COLORS },
    size: { control: 'select', options: SIZES },
    children: { control: 'text' },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    showTextWhileLoading: { control: 'boolean' },
  },
  args: { color: 'primary', size: 'md', children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Play with the props via the Controls panel. */
export const Playground: Story = {};

/** Every colour variant. `primary` is the outlined rust-orange with a hover glow;
 * `accent` is the charcoal-fill alternative. */
export const Colors: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      {COLORS.map((color) => (
        <Button key={color} color={color}>
          {color}
        </Button>
      ))}
    </div>
  ),
};

/** From `xs` to `xl`. */
export const Sizes: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      {SIZES.map((size) => (
        <Button key={size} size={size}>
          Button {size}
        </Button>
      ))}
    </div>
  ),
};

/** Leading, trailing, both, and icon-only (omit children). */
export const WithIcons: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconLeading={Plus}>Add item</Button>
      <Button iconTrailing={ArrowRight}>Continue</Button>
      <Button color="secondary" iconLeading={Download01} iconTrailing={ArrowRight}>
        Download
      </Button>
      <Button color="secondary" iconLeading={Plus} aria-label="Add" />
    </div>
  ),
};

/** Default, disabled, loading (spinner replaces content), and loading with text. */
export const States: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconLeading={Download01}>Download</Button>
      <Button iconLeading={Download01} isDisabled>
        Disabled
      </Button>
      <Button iconLeading={Download01} isLoading>
        Loading
      </Button>
      <Button iconLeading={Download01} isLoading showTextWhileLoading>
        Saving…
      </Button>
    </div>
  ),
};

/** The destructive colour set, for dangerous actions. */
export const Destructive: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary-destructive" iconLeading={Trash01}>
        Delete
      </Button>
      <Button color="secondary-destructive" iconLeading={Trash01}>
        Delete
      </Button>
      <Button color="tertiary-destructive" iconLeading={Trash01}>
        Delete
      </Button>
      <Button color="link-destructive">Delete</Button>
    </div>
  ),
};
