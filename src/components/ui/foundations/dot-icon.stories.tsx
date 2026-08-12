import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dot } from './dot-icon';

const meta = {
  title: 'UI/Foundations/Dot',
  component: Dot,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { size: 'md' },
} satisfies Meta<typeof Dot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The small status dot used inside badges and indicators. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Dot {...args} className="text-fg-success-primary" />
      <Dot {...args} className="text-fg-warning-primary" />
      <Dot {...args} className="text-fg-error-primary" />
      <Dot {...args} className="text-fg-quaternary" />
    </div>
  ),
};
