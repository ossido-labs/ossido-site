import type { ReactElement } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Cube, OxygenAtom } from '../components/home-hero';

const meta = {
  title: 'Example/Cube',
  component: Cube,
  parameters: {
    // Center the cube in the Canvas so the isometric rest pose sits neatly.
    layout: 'centered',
  },
  // Render on a dark backdrop — the Three.js canvas is transparent and the cube
  // is designed to sit on the app's near-black background.
  decorators: [
    (Story): ReactElement => (
      <div style={{ padding: '3rem', background: '#0a0a0e' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    size: { control: { type: 'range', min: 200, max: 1000, step: 20 } },
    duration: { control: { type: 'range', min: 0.2, max: 8, step: 0.1 } },
    delay: { control: { type: 'range', min: 0, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof Cube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 600,
    color: '#ffffff',
    duration: 2.8,
    delay: 0,
  },
};

export const Tinted: Story = {
  args: {
    size: 600,
    color: '#fbc100',
    duration: 2.8,
    delay: 0,
  },
};

export const LargeSlow: Story = {
  args: {
    size: 900,
    color: '#ffffff',
    duration: 5.2,
    delay: 0,
  },
};

export const Delayed: Story = {
  args: {
    size: 600,
    color: '#ffffff',
    duration: 2.8,
    delay: 1,
  },
};

/** The cube in front of the paired, counter-rotating "oxide" translation rings. */
export const WithRing: Story = {
  args: {
    size: 690,
    color: '#ffffff',
    duration: 2.8,
    delay: 0,
  },
  render: (args): ReactElement => {
    const cube = args.size ?? 690;
    const atom = Math.round(cube * 1.34); // interleaved word + electron rings, outermost
    const layer = { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' } as const;
    return (
      <div style={{ position: 'relative', width: atom, height: atom, background: '#0a0a0e' }}>
        <div style={layer}>
          <OxygenAtom size={atom} />
        </div>
        <div style={{ ...layer, zIndex: 1 }}>
          <Cube {...args} />
        </div>
      </div>
    );
  },
};
