import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostHeader } from './post-header';

const meta = {
  title: 'Blog/PostHeader',
  component: PostHeader,
  tags: ['autodocs'],
  argTypes: { date: { control: 'text' } },
} satisfies Meta<typeof PostHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The header atop a news post: formatted date and title. */
export const Default: Story = {
  args: {
    title: 'Ossido 0.1.3: server actions and a real async event loop',
    date: '2026-08-11',
  },
};
