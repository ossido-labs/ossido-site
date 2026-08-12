import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReferenceSidebar } from './reference-sidebar';

const meta = {
  title: 'Navigation/ReferenceSidebar',
  component: ReferenceSidebar,
  tags: ['autodocs'],
} satisfies Meta<typeof ReferenceSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The API Reference left rail: a Rust/React ecosystem switcher above symbol links
 *  grouped by kind. Reads the generated reference data. */
export const Default: Story = {};

/** On a symbol's page, the switcher defaults to that symbol's ecosystem and the
 *  current entry is highlighted. */
export const OnASymbol: Story = {
  parameters: { route: '/api-reference/action' },
};
