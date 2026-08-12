'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  InfoCircle,
} from '@untitledui/icons';
import { Toaster as SonnerToaster, toast } from 'sonner';
import type { ToasterProps } from 'sonner';

/** Status icons, each carrying its own meaning colour (sonner's defaults render
 * neutral). Passed to the Toaster's `icons` prop. */
const STATUS_ICONS = {
  success: <CheckCircle className="size-5 text-fg-success-primary" />,
  error: <AlertCircle className="size-5 text-fg-error-primary" />,
  warning: <AlertTriangle className="size-5 text-fg-warning-primary" />,
  info: <InfoCircle className="size-5 text-ossido-cyan" />,
};

/**
 * Toast host for the app - a thin wrapper over Sonner, themed to match the ossido
 * design system (dark surface, rounded card, brand-coloured actions and status
 * icons). Mount `<Toaster />` once near the app root, then call `toast(...)`.
 *
 * Defaults to bottom-centre; pass `position` to override.
 */
export function Toaster({
  position = 'bottom-center',
  ...props
}: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position={position}
      gap={10}
      icons={STATUS_ICONS}
      {...props}
      toastOptions={{
        classNames: {
          toast:
            'group !gap-3 !rounded-xl !border !border-secondary !bg-primary !text-primary !shadow-lg',
          title: '!text-sm !font-semibold !text-primary',
          description: '!text-sm !text-tertiary',
          actionButton:
            '!rounded-md !bg-brand-solid !px-2 !text-xs !font-semibold !text-brand-950',
          cancelButton:
            '!rounded-md !bg-secondary !px-2 !text-xs !font-semibold !text-secondary',
          closeButton:
            '!rounded-md !border-secondary !bg-primary !text-fg-quaternary hover:!text-fg-primary',
        },
        ...props.toastOptions,
      }}
    />
  );
}

export { toast };
