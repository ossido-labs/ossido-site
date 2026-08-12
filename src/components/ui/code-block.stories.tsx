import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from './code-block';

const meta = {
  title: 'UI/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['sh', 'json', 'powershell', 'rust', 'ts', 'tsx', 'css'],
    },
    disableShell: { control: 'boolean' },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rust: Story = {
  args: {
    language: 'rust',
    code: `#[handler]
async fn home(_req: Request) -> HomeProps {
    HomeProps { message: "Hello from Rust".into() }
}`,
  },
};

export const TypeScript: Story = {
  args: {
    language: 'tsx',
    code: `import { Link } from '@ossido-labs/ossido'

<Link href="/guides" preload>Guides</Link>`,
  },
};

export const Shell: Story = {
  args: {
    language: 'sh',
    code: `bun install
bun run dev`,
  },
};

/** `disableShell` drops the language badge + copy bar, leaving just the highlighted
 *  code - used for the compact signatures on the API Reference pages. */
export const BareSignature: Story = {
  args: {
    language: 'rust',
    disableShell: true,
    code: '#[action]\nasync fn act(input: In) -> Result<Out, ActionError>',
  },
};
