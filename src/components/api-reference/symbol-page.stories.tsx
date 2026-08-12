import type { Meta, StoryObj } from '@storybook/react-vite';
import { SymbolPage } from './symbol-page';

const meta = {
  title: 'API Reference/SymbolPage',
  component: SymbolPage,
  tags: ['autodocs'],
  argTypes: {
    entryKey: {
      control: 'select',
      options: [
        'handler',
        'action',
        'middleware',
        'request',
        'files',
        'link',
        'use-router',
        'ossido-config',
      ],
    },
  },
} satisfies Meta<typeof SymbolPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A macro reference page: badges, description, signature, and worked examples. */
export const Action: Story = { args: { entryKey: 'action' } };

/** A Rust struct. */
export const Request: Story = { args: { entryKey: 'request' } };

/** A React hook. */
export const UseRouter: Story = { args: { entryKey: 'use-router' } };
