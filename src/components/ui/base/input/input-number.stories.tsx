import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputNumber } from './input-number';

const meta = {
  title: 'UI/Input/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  args: { label: 'Quantity', size: 'md', defaultValue: 1 },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HorizontalSteppers: Story = {
  args: { orientation: 'horizontal' },
};
