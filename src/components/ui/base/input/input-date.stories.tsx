import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputDate } from './input-date';

const meta = {
  title: 'UI/Input/InputDate',
  component: InputDate,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { label: 'Start date', size: 'md' },
} satisfies Meta<typeof InputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = {
  args: { hint: 'When the project kicks off.' },
};
