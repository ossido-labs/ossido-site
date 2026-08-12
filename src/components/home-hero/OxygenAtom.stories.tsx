import type { Meta, StoryObj } from '@storybook/react-vite';
import { OxygenAtom } from './OxygenAtom';

const meta = {
  title: 'Hero/OxygenAtom',
  component: OxygenAtom,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: { type: 'range', min: 200, max: 1000, step: 20 } },
    color: { control: 'color' },
    enterDelay: { control: { type: 'range', min: 0, max: 4, step: 0.1 } },
  },
} satisfies Meta<typeof OxygenAtom>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full oxide motif: two counter-rotating "oxide" word rings interleaved with
 *  oxygen's two electron shells. */
export const Default: Story = {
  args: { size: 600, enterDelay: 1.6 },
};

export const Small: Story = {
  args: { size: 320, enterDelay: 0.4 },
};
