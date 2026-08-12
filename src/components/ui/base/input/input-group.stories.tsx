import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputBase } from './input';
import { InputGroup } from './input-group';

const meta = {
  title: 'UI/Input/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A field with a leading prefix (e.g. a currency symbol). */
export const WithPrefix: Story = {
  args: {
    label: 'Amount',
    prefix: '$',
    size: 'md',
    children: <InputBase placeholder="0.00" />,
  },
};

/** A trailing addon (e.g. a unit or domain suffix). */
export const WithTrailingAddon: Story = {
  args: {
    label: 'Website',
    trailingAddon: '.ossido.dev',
    size: 'md',
    children: <InputBase placeholder="my-app" />,
  },
};
