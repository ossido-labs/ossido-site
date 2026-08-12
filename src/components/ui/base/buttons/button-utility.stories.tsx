import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchMd } from '@untitledui/icons';
import { ButtonUtility } from './button-utility';

const meta = {
  title: 'UI/Buttons/ButtonUtility',
  component: ButtonUtility,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm'] },
    color: { control: 'inline-radio', options: ['secondary', 'tertiary'] },
  },
  args: { icon: SearchMd, tooltip: 'Search', size: 'sm', color: 'secondary' },
} satisfies Meta<typeof ButtonUtility>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An icon-only button with a tooltip (hover to see it). */
export const Default: Story = {};
export const Tertiary: Story = { args: { color: 'tertiary' } };
export const Disabled: Story = { args: { isDisabled: true } };
