import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentInput } from './input-payment';

const meta = {
  title: 'UI/Input/PaymentInput',
  component: PaymentInput,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Card number',
    placeholder: '1234 5678 9012 3456',
    size: 'md',
  },
} satisfies Meta<typeof PaymentInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The matching card brand icon appears as you type (Visa shown here). */
export const Filled: Story = { args: { defaultValue: '4242 4242 4242 4242' } };
