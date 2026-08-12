import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputTagsOuter } from './input-tags-outer';

const meta = {
  title: 'UI/Input/InputTagsOuter',
  component: InputTagsOuter,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Topics',
    placeholder: 'Type and press Enter',
    size: 'md',
    defaultValue: ['design', 'code'],
  },
} satisfies Meta<typeof InputTagsOuter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same as InputTags, but the tags render below the field instead of inside it. */
export const Default: Story = {};
