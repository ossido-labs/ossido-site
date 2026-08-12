import type { Meta, StoryObj } from '@storybook/react-vite';
import { NativeSelect } from './select-native';

const meta = {
  title: 'UI/Select/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    label: 'Environment',
    size: 'md',
    options: [
      { label: 'Development', value: 'dev' },
      { label: 'Staging', value: 'staging' },
      { label: 'Production', value: 'prod' },
    ],
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain native `<select>`, styled to match. */
export const Default: Story = {};
