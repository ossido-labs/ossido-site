import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wordmark } from './wordmark';

const meta = {
  title: 'Global/Wordmark',
  component: Wordmark,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Wordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Ossido logo (orbit mark + wordmark). Accepts standard SVG props. */
export const Default: Story = {};
