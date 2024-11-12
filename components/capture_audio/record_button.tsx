import React from 'react';
import { cn } from '@/lib/utils';

export type RecordButtonStateType = 'recording' | 'transcribing' | 'disabled' | 'idle';

type RecordButtonProps = {
  recordingButtonState: RecordButtonStateType;
  handleClick: () => void;
};

const RecordButton: React.FC<RecordButtonProps> = ({ recordingButtonState, handleClick }) => {
  const loadingImage = '/images/loading-circle.png';

  const isRecording = recordingButtonState === 'recording';
  const isTranscribing = recordingButtonState === 'transcribing';
  const isDisabled = recordingButtonState === 'disabled';

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        className={cn(
          isDisabled ? 'cursor-default' : 'cursor-pointer',
          'flex items-center justify-center h-20 w-20 rounded-full border-2',
          isDisabled ? 'border-gray-400' : isTranscribing ? 'border-blue-700' : 'border-red-500'
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        disabled={isDisabled}
      >
        {isRecording ? (
          <div className="h-12 w-12 bg-red-500 rounded-lg" />
        ) : isTranscribing ? (
          <img src={loadingImage} alt="loading" className="h-16 w-16 animate-spin" />
        ) : isDisabled ? (
          <div className="h-14 w-14 bg-gray-400 rounded-full" />
        ) : (
          <div className="h-14 w-14 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
};

export default RecordButton;
