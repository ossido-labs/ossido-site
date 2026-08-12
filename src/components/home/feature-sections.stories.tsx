import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureSections } from './feature-sections';

const meta = {
  title: 'Home/FeatureSections',
  component: FeatureSections,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FeatureSections>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The home-page feature sections (alternating prose + code samples). */
export const Default: Story = {};
