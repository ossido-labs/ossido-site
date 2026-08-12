import type { Meta, StoryObj } from '@storybook/react-vite';
import { HintText } from './hint-text';

const meta = {
  title: 'UI/Input/HintText',
  component: HintText,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { children: 'This is a hint below a field.' },
} satisfies Meta<typeof HintText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = {
  args: { isInvalid: true, children: 'Please enter a valid email address.' },
};
