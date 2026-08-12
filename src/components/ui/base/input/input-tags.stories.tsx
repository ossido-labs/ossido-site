import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputTags } from './input-tags';

const meta = {
  title: 'UI/Input/InputTags',
  component: InputTags,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Skills',
    placeholder: 'Add a skill and press Enter',
    size: 'md',
    defaultValue: ['React', 'TypeScript'],
  },
} satisfies Meta<typeof InputTags>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tags live inside the field. */
export const Default: Story = {};
