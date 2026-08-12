import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './header';

const meta = {
  title: 'Navigation/Header',
  component: Header,
  tags: ['autodocs'],
  // Full-width sticky site header; render edge to edge.
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site header: wordmark, primary nav, search, and the GitHub / Learn actions.
 *  (Links and the search context are mocked for Storybook.) */
export const Default: Story = {};
