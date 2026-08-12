import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './select';
import type { SelectItemType } from './select-shared';

const ITEMS: Array<SelectItemType> = [
  { id: 'react', label: 'React' },
  { id: 'rust', label: 'Rust' },
  { id: 'both', label: 'Both', supportingText: 'Recommended' },
];

const meta = {
  title: 'UI/Select/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Stack',
    placeholder: 'Pick one',
    size: 'md',
    items: ITEMS,
    children: (item: SelectItemType) => (
      <Select.Item id={item.id}>{item.label}</Select.Item>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single-select dropdown. Click to open. */
export const Default: Story = {};

export const WithHint: Story = { args: { hint: 'You can change this later.' } };
