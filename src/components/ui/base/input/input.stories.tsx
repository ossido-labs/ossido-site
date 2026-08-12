import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchMd } from '@untitledui/icons';
import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { label: 'Email', placeholder: 'you@example.com', size: 'md' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = {
  args: { hint: "We'll never share your email." },
};
export const WithIcon: Story = {
  args: { icon: SearchMd, placeholder: 'Search' },
};
export const Invalid: Story = {
  args: { isInvalid: true, hint: 'That email looks off.' },
};
export const Disabled: Story = { args: { isDisabled: true } };
