import type { Meta, StoryObj } from '@storybook/react-vite';
import { FloatyCard } from './floaty-card';

const meta = {
  title: 'UI/FloatyCard',
  component: FloatyCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    glow: { control: 'color' },
    href: { control: 'text' },
  },
} satisfies Meta<typeof FloatyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The card lifts and tilts toward the cursor, with a sheen that follows the pointer. */
export const Default: Story = {
  args: {
    href: '#',
    className:
      'block max-w-sm rounded-2xl border border-secondary bg-primary p-7',
    children: (
      <>
        <span className="text-xs font-semibold uppercase tracking-wider text-ossido-orange">
          Guide
        </span>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-primary">
          Build your first Ossido app
        </h3>
        <p className="mt-2 text-sm/relaxed text-tertiary">
          From an empty project to a data-driven app across the Rust/React
          boundary.
        </p>
      </>
    ),
  },
};

export const OrangeGlow: Story = {
  args: {
    ...Default.args,
    glow: 'var(--color-ossido-orange)',
  },
};
