import { useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/base/buttons/button';
import { Toaster, toast } from './toast';

/**
 * Sonner-backed toasts, themed to the ossido look and defaulting to bottom-centre.
 * Mount `<Toaster />` once (it lives in the app layout) and call `toast(...)`.
 */

// Toasts portal to <body>, so give <body> the app's dark-mode class here (the real
// app already sets it) and mount a single <Toaster /> for every story.
function ToastCanvas({ children }: { children: ReactNode }): ReactElement {
  useEffect(() => {
    document.body.classList.add('dark-mode');
    return () => document.body.classList.remove('dark-mode');
  }, []);
  return (
    <div className="dark-mode bg-ossido-background grid min-h-svh place-items-center p-10">
      <Toaster />
      {children}
    </div>
  );
}

const meta = {
  title: 'UI/Toast',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story): ReactElement => (
      <ToastCanvas>
        <Story />
      </ToastCanvas>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** A plain message. */
export const Default: Story = {
  render: (): ReactElement => (
    <Button
      onPress={() =>
        toast('Deployment queued', {
          description: 'Your changes are on the way.',
        })
      }
    >
      Show toast
    </Button>
  ),
};

/** The status variants - each gets its meaning colour on the icon. */
export const Types: Story = {
  render: (): ReactElement => (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        color="secondary"
        onPress={() =>
          toast.success('Build succeeded', { description: 'Deployed in 2.4s.' })
        }
      >
        Success
      </Button>
      <Button
        color="secondary"
        onPress={() =>
          toast.error('Build failed', {
            description: 'See the logs for details.',
          })
        }
      >
        Error
      </Button>
      <Button
        color="secondary"
        onPress={() =>
          toast.info('New version available', {
            description: 'v0.4.1 is ready.',
          })
        }
      >
        Info
      </Button>
      <Button
        color="secondary"
        onPress={() =>
          toast.warning('Unsaved changes', {
            description: 'Save before you leave.',
          })
        }
      >
        Warning
      </Button>
    </div>
  ),
};

/** A toast with an action button. */
export const WithAction: Story = {
  render: (): ReactElement => (
    <Button
      onPress={() =>
        toast('File deleted', {
          description: 'report.pdf was moved to trash.',
          action: {
            label: 'Undo',
            onClick: () => toast.success('Restored report.pdf'),
          },
        })
      }
    >
      Delete file
    </Button>
  ),
};

/** Drive a toast from a promise: loading → success / error. */
export const Promise: Story = {
  render: (): ReactElement => (
    <Button
      onPress={() => {
        const save = new window.Promise((resolve) => setTimeout(resolve, 1600));
        toast.promise(save, {
          loading: 'Saving...',
          success: 'Saved your changes',
          error: 'Could not save',
        });
      }}
    >
      Save
    </Button>
  ),
};
