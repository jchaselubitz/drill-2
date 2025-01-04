import { type VariantProps } from 'class-variance-authority';
import { Check, Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { Button, buttonVariants } from './button';

export type ButtonLoadingState = 'default' | 'disabled' | 'loading' | 'success' | 'error';
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  buttonState: ButtonLoadingState;
  text: string | React.ReactNode;
  loadingText: string | React.ReactNode;
  successText?: string | React.ReactNode;
  errorText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
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
    const isString = (value: any): value is string => {
      return typeof value === 'string';
    };

    return (
      <Button
        disabled={buttonState === 'loading' || buttonState === 'disabled'}
        variant={variant}
        size={size}
        className={className}
        ref={ref}
        asChild={asChild}
        {...props}
      >
        {buttonState === 'loading' ? (
          <span className="flex gap-2 items-center">
            {isString(loadingText) && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{' '}
            {loadingText}
          </span>
        ) : buttonState === 'success' ? (
          <span className="flex gap-2 justify-between items-center">
            {successText}
            {isString(successText) && <Check className="ml-2 h-4 w-4" />}
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
