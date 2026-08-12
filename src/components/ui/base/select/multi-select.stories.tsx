import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelect } from './multi-select';
import type { SelectItemType } from './select-shared';

const ITEMS: Array<SelectItemType> = [
  { id: 'react', label: 'React' },
  { id: 'rust', label: 'Rust' },
  { id: 'axum', label: 'Axum' },
  { id: 'tailwind', label: 'Tailwind' },
];

const meta = {
  title: 'UI/Select/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Tech',
    placeholder: 'Select several',
    size: 'md',
    items: ITEMS,
    defaultSelectedKeys: new Set(['react', 'rust']),
    children: (item: SelectItemType) => (
      <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>
    ),
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pick multiple items; selected ones show as removable chips. */
export const Default: Story = {};
