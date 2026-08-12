import type { Meta, StoryObj } from '@storybook/react-vite';
import { OnThisPage } from './on-this-page';

const meta = {
  title: 'Docs/OnThisPage',
  component: OnThisPage,
  tags: ['autodocs'],
} satisfies Meta<typeof OnThisPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The right-rail "On this page" table of contents (h2s at the top level, h3s
 *  indented). The active heading highlights on scroll in the real page. */
export const Default: Story = {
  args: {
    headings: [
      { id: 'installation', text: 'Installation', level: 2 },
      { id: 'the-cli', text: 'The CLI', level: 3 },
      { id: 'configuration', text: 'Configuration', level: 3 },
      { id: 'writing-a-handler', text: 'Writing a handler', level: 2 },
      { id: 'error-handling', text: 'Error handling', level: 2 },
    ],
  },
};

/** With no headings the rail renders nothing (returns null). */
export const Empty: Story = {
  args: { headings: [] },
};
