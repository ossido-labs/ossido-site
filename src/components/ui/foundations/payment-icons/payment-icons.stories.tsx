import type { FC, SVGProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as PaymentIcons from './index';

// Every exported icon component, discovered from the barrel so the gallery stays in
// sync as icons are added/removed.
const ICONS = Object.entries(PaymentIcons).filter(
  ([, value]) => typeof value === 'function',
) as Array<[string, FC<SVGProps<SVGSVGElement>>]>;

const meta = {
  title: 'UI/Foundations/PaymentIcons',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full set of payment-brand icons. */
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {ICONS.map(([name, Icon]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-lg border border-secondary p-3"
        >
          <Icon className="h-8 w-auto" />
          <span className="text-center text-[10px] text-tertiary">{name}</span>
        </div>
      ))}
    </div>
  ),
};
