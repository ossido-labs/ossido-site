import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen01 } from '@untitledui/icons';
import { FeaturedIcon } from './featured-icon';

const meta = {
  title: 'UI/Foundations/FeaturedIcon',
  component: FeaturedIcon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    color: {
      control: 'inline-radio',
      options: ['brand', 'gray', 'success', 'warning', 'error'],
    },
    theme: {
      control: 'inline-radio',
      options: [
        'light',
        'gradient',
        'dark',
        'outline',
        'modern',
        'modern-neue',
      ],
    },
  },
  args: { icon: BookOpen01, color: 'brand', theme: 'light', size: 'md' },
} satisfies Meta<typeof FeaturedIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Themes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <FeaturedIcon {...args} theme="light" />
      <FeaturedIcon {...args} theme="gradient" />
      <FeaturedIcon {...args} theme="dark" />
      <FeaturedIcon {...args} theme="outline" />
      <FeaturedIcon {...args} theme="modern" />
    </div>
  ),
};
