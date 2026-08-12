import type { Meta, StoryObj } from '@storybook/react-vite';
import { useListData } from 'react-stately';
import { TagSelect } from './tag-select';
import type { SelectItemType } from './select-shared';

const ITEMS: Array<SelectItemType> = [
  { id: 'react', label: 'React' },
  { id: 'rust', label: 'Rust' },
  { id: 'axum', label: 'Axum' },
  { id: 'vite', label: 'Vite' },
];

const TagSelectDemo = () => {
  // State
  const selectedItems = useListData<SelectItemType>({
    initialItems: [ITEMS[0]],
  });

  return (
    <TagSelect
      label="Tech"
      placeholder="Add tech"
      items={ITEMS}
      selectedItems={selectedItems}
      onItemInserted={(key) => {
        const item = ITEMS.find((i) => i.id === key);
        if (item) selectedItems.append(item);
      }}
      onItemCleared={(key) => selectedItems.remove(key)}
    >
      {(item) => <TagSelect.Item id={item.id}>{item.label}</TagSelect.Item>}
    </TagSelect>
  );
};

// `selectedItems` is a react-stately ListData built by a hook, so this story is
// composition-only (no component-level args).
const meta = {
  title: 'UI/Select/TagSelect',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A combobox whose selections become removable tags inside the field. */
export const Default: Story = {
  render: () => <TagSelectDemo />,
};
