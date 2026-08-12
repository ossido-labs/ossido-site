import type { Meta, StoryObj } from '@storybook/react-vite';
import { PinInput } from './pin-input';

const meta = {
  title: 'UI/Input/PinInput',
  component: PinInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A 4-slot one-time-code / PIN input. */
export const Default: Story = {
  render: () => (
    <PinInput size="md">
      <PinInput.Label>Enter your PIN</PinInput.Label>
      <PinInput.Group maxLength={4}>
        {Array.from({ length: 4 }, (_, i) => (
          <PinInput.Slot key={i} index={i} />
        ))}
      </PinInput.Group>
      <PinInput.Description>
        4-digit code sent to your phone.
      </PinInput.Description>
    </PinInput>
  ),
};
