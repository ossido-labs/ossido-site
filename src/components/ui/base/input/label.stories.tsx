import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './label';

const meta = {
  title: 'UI/Input/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Email address' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Required: Story = { args: { isRequired: true } };
export const WithTooltip: Story = {
  args: { tooltip: 'We use this to send receipts.', isRequired: true },
};
