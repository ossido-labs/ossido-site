import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './textarea';

const meta = {
  title: 'UI/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: {
    label: 'Description',
    placeholder: 'Tell us what you think...',
    rows: 5,
    size: 'md',
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Markdown is supported.' } };
