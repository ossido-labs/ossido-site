import type { Meta, StoryObj } from '@storybook/react-vite';
import { PillarCards } from './pillar-cards';

const meta = {
  title: 'Home/PillarCards',
  component: PillarCards,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PillarCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three home-page pillar cards (Rust backend, React frontend, Tuono roots),
 *  each tilting and lifting toward the cursor. */
export const Default: Story = {};
