import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './footer';

const meta = {
  title: 'Global/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site footer: brand, social links, and the grouped link columns. */
export const Default: Story = {};
