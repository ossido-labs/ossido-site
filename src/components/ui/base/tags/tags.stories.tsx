import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, TagGroup, TagList } from './tags';

const meta = {
  title: 'UI/Tags',
  component: TagGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { label: 'Tags', size: 'md' },
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Removable tags with optional dots and counts. */
export const Default: Story = {
  render: (args) => (
    <TagGroup {...args}>
      <TagList>
        <Tag id="react" onClose={() => undefined}>
          React
        </Tag>
        <Tag id="active" dot>
          Active
        </Tag>
        <Tag id="users" count={5}>
          Users
        </Tag>
      </TagList>
    </TagGroup>
  ),
};
