import { ArrowDown, CirclePause, CirclePlay, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying: boolean;
  isLoading: boolean;
  exists: boolean | undefined;
  handleClick: () => void;
}

const AudioPlayButton = React.forwardRef<HTMLButtonElement, AudioButtonProps>(
  ({ className, isPlaying, isLoading, handleClick, exists, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        disabled={isLoading}
        className={cn(
          [
            'flex items-center justify-center gap-2 h-10 w-10 transition-colors duration-150  rounded-full hover:text-white focus:outline-none focus:shadow-outline-blue',
          ],
          [
            exists
              ? 'border-blue-600 text-blue-600 active:bg-blue-600 hover:bg-blue-700'
              : 'border-gray-800 text-gray-800 active:bg-gray-800 hover:bg-gray-900',
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
          <CirclePause className="h-7 w-7 text-red-800" />
        ) : exists ? (
          <CirclePlay className="h-7 w-7" />
        ) : (
          <ArrowDown />
        )}{' '}
      </button>
    );
  }
);
AudioPlayButton.displayName = 'AudioPlayButton';

export { AudioPlayButton };
