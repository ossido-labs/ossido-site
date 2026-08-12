import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
  args: { size: 'md', initials: 'OS', alt: 'Ossido' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Falls back to initials when there's no image. */
export const Initials: Story = {};
export const Online: Story = { args: { status: 'online' } };
export const Verified: Story = { args: { verified: true } };
export const WithCount: Story = { args: { count: 5 } };
