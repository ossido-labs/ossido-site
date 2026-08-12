import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioButton, RadioGroup } from './radio-buttons';

const meta = {
  title: 'UI/RadioButtons',
  component: RadioGroup,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Framework',
    defaultValue: 'react',
    children: (
      <>
        <RadioButton
          value="react"
          label="React"
          hint="The library for web UIs."
        />
        <RadioButton
          value="rust"
          label="Rust"
          hint="Fast, memory-safe backend."
        />
        <RadioButton
          value="both"
          label="Both"
          hint="Ossido pairs them together."
        />
      </>
    ),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
