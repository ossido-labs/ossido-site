import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComboBox } from './combobox';
import { SelectItem } from './select-item';
import type { SelectItemType } from './select-shared';

const ITEMS: Array<SelectItemType> = [
  { id: 'react', label: 'React' },
  { id: 'rust', label: 'Rust' },
  { id: 'axum', label: 'Axum' },
  { id: 'vite', label: 'Vite' },
];

const meta = {
  title: 'UI/Select/ComboBox',
  component: ComboBox,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Search stack',
    placeholder: 'Type to filter',
    size: 'md',
    items: ITEMS,
    children: (item: SelectItemType) => (
      <SelectItem id={item.id}>{item.label}</SelectItem>
    ),
  },
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A searchable single-select. Type to filter the options. */
export const Default: Story = {};
