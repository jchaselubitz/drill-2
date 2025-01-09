import { Stars } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { LoadingButton, LoadingButtonProps } from '../ui/button-loading';

interface AIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  withStars?: boolean;
}

export const aiButtonClass =
  'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 hover:bg-gradient-to-r text-white w-fit flex gap-2';
export function AIButton({
  onClick,
  children = 'Discuss in chat',
  className = '',
  withStars = true,
}: AIButtonProps) {
  return (
    <Button className={`${aiButtonClass} ${className}`} onClick={onClick}>
      {withStars && <Stars />} {children}
    </Button>
  );
}

type AILoadingButtonProps = AIButtonProps & LoadingButtonProps;

export function AILoadingButton({
  onClick,
  text,
  loadingText,
  successText,
  errorText,
  className = '',
  withStars = false,
  buttonState,
  reset,
  setButtonState,
}: AILoadingButtonProps) {
  return (
    <LoadingButton
      onClick={onClick}
      className={`${aiButtonClass} ${className}`}
      buttonState={buttonState}
      reset={reset}
      setButtonState={setButtonState}
      text={
        <>
          {withStars && <Stars />}
          {text}{' '}
        </>
      }
      loadingText={
        <>
          {withStars && <Stars />}
          {loadingText}{' '}
        </>
      }
      successText={
        <>
          {withStars && <Stars />}
          {successText}{' '}
        </>
      }
      errorText={errorText}
    />
  );
}
