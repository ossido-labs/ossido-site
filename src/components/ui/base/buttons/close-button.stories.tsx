import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloseButton } from './close-button';

const meta = {
  title: 'UI/Buttons/CloseButton',
  component: CloseButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
  args: { size: 'sm', theme: 'light', label: 'Close' },
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = { args: { theme: 'dark' } };
