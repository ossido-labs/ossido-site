import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPalette } from './command-palette';

const meta = {
  title: 'Search/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { isOpen: true, onOpenChange: () => undefined },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const PaletteDemo = () => {
  // State
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-secondary px-3 py-1.5 text-sm text-fg-primary"
      >
        Open command palette
      </button>
      <CommandPalette isOpen={open} onOpenChange={setOpen} />
    </div>
  );
};

/** The Cmd/Ctrl+K search dialog. Shows suggestions before typing, then searches the
 *  static index (`/search-index.json`) as you type; navigation is mocked. */
export const Open: Story = {
  render: () => <PaletteDemo />,
};
