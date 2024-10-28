import * as React from 'react';

import { type VariantProps } from 'class-variance-authority';

import { Button, buttonVariants } from './button';
import { Check } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';

export type ButtonLoadingState = 'default' | 'disabled' | 'loading' | 'success' | 'error';
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  buttonState: ButtonLoadingState;
  text: string;
  loadingText: string;
  successText?: string;
  errorText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild,
      text,
      loadingText,
      successText,
      errorText,
      buttonState = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <Button
        disabled={buttonState === 'loading' || buttonState === 'disabled'}
        variant={variant}
        size={size}
        className={className}
        ref={ref}
        {...props}
      >
        {buttonState === 'loading' ? (
          <span className="flex gap-2 items-center">
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> {loadingText}{' '}
          </span>
        ) : buttonState === 'success' ? (
          <span className="flex gap-2 justify-between items-center">
            {successText}
            <Check className="ml-2 h-4 w-4" />
          </span>
        ) : buttonState === 'error' ? (
          <span className="flex gap-2 items-center">{errorText}</span>
        ) : (
          text
        )}{' '}
      </Button>
    );
  }
);
LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
