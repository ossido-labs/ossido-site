import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputFile } from './input-file';

const meta = {
  title: 'UI/Input/InputFile',
  component: InputFile,
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { label: 'Upload document', buttonText: 'Upload', size: 'sm' },
} satisfies Meta<typeof InputFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AcceptsImages: Story = {
  args: {
    acceptedFileTypes: ['image/png', 'image/jpeg'],
    allowsMultiple: true,
  },
};
export const Loading: Story = { args: { isLoading: true } };
