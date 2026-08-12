import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './toggle';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { label: 'Dark mode', size: 'sm' },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultSelected: true } };
export const WithHint: Story = {
  args: { hint: 'Applies across the whole app.', defaultSelected: true },
};
export const Disabled: Story = {
  args: { isDisabled: true, defaultSelected: true },
};
