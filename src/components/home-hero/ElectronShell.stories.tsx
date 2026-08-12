import type { Meta, StoryObj } from '@storybook/react-vite';
import { ElectronShell } from './ElectronShell';

const meta = {
  title: 'Hero/ElectronShell',
  component: ElectronShell,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: { type: 'range', min: 200, max: 900, step: 20 } },
    electrons: { control: { type: 'range', min: 1, max: 10, step: 1 } },
    duration: { control: { type: 'range', min: 4, max: 120, step: 1 } },
    reverse: { control: 'boolean' },
    color: { control: 'color' },
  },
} satisfies Meta<typeof ElectronShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Oxygen's outer shell: 6 electrons orbiting a faint ring. */
export const OuterShell: Story = {
  args: { size: 420, electrons: 6, duration: 17 },
};

/** The inner shell: 2 electrons, offset and counter-rotating. */
export const InnerShell: Story = {
  args: {
    size: 300,
    electrons: 2,
    duration: 12,
    reverse: true,
    startAngle: Math.PI / 2,
  },
};
