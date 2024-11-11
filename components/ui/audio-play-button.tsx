import * as React from 'react';

import { ArrowDown, Loader2Icon, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying: boolean;
  isLoading: boolean;
  exists: boolean | undefined;
  handleClick: () => void;
}

const AudioPlayButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, isPlaying, isLoading, handleClick, exists, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        disabled={isLoading}
        className={cn(
          [
            'flex items-center justify-center gap-2 h-10 w-10 transition-colors duration-150 border-2 rounded-full hover:text-white focus:outline-none focus:shadow-outline-blue',
          ],
          [
            !exists
              ? 'border-gray-800 text-gray-800 active:bg-gray-800 hover:bg-gray-900'
              : 'border-blue-600 text-blue-600 active:bg-blue-600 hover:bg-blue-700',
          ],
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {isLoading ? (
          <Loader2Icon className=" h-8 w-8 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-8 w-8" />
        ) : exists ? (
          <Play className="h-8 w-8" />
        ) : (
          <ArrowDown />
        )}{' '}
      </button>
    );
  }
);
AudioPlayButton.displayName = 'AudioPlayButton';

export { AudioPlayButton };
