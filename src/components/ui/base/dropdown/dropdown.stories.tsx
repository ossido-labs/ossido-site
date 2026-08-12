import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from './dropdown';

const meta = {
  title: 'UI/Dropdown',
  component: Dropdown.Menu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dropdown.Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A menu opened from the "..." utility button. Click the trigger to open it. */
export const Default: Story = {
  render: () => (
    <Dropdown.Root>
      <Dropdown.DotsButton />
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item textValue="edit" label="Edit" />
          <Dropdown.Item textValue="duplicate" label="Duplicate" />
          <Dropdown.Separator />
          <Dropdown.Item textValue="delete" label="Delete" />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  ),
};
