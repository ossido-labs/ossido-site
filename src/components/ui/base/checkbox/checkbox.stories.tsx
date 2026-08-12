import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { label: 'I agree to the terms', size: 'sm' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultSelected: true } };
export const WithHint: Story = {
  args: {
    hint: 'You can change this later in settings.',
    defaultSelected: true,
  },
};
export const Disabled: Story = {
  args: { isDisabled: true, defaultSelected: true },
};
