import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordRing } from './WordRing';

const meta = {
  title: 'Hero/WordRing',
  component: WordRing,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: { type: 'range', min: 200, max: 900, step: 20 } },
    duration: { control: { type: 'range', min: 5, max: 120, step: 1 } },
    fontSize: { control: { type: 'range', min: 2, max: 10, step: 0.1 } },
    reverse: { control: 'boolean' },
    color: { control: 'color' },
  },
} satisfies Meta<typeof WordRing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A slowly rotating ring of the word "oxide" across languages. */
export const Default: Story = {
  args: { size: 420, duration: 40, color: '#61dafb' },
};

export const Reversed: Story = {
  args: { size: 420, duration: 40, reverse: true, color: '#f74b00' },
};
