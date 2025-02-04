import React, { useEffect, useState } from 'react';

import { Button } from '../ui/button';
import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';
import TrimAudio from './trim_audio';

interface MediaReviewProps {
  audioResponse: { blob: Blob; url: string };
  setAudioResponse: (audioResponse: { blob: Blob; url: string }) => void;
  transcriptionLoading: boolean;
  transcribeRecording: () => Promise<void>;
  saveRecording: () => Promise<void>;
  resetRecordingButtonState: () => void;
  isTranscript: boolean;
  saveButtonState: ButtonLoadingState;
}

const maxDuration = 120;

const MediaReview: React.FC<MediaReviewProps> = ({
  audioResponse,
  setAudioResponse,
  transcriptionLoading,
  transcribeRecording,
  saveRecording,
  resetRecordingButtonState,
  isTranscript,
  saveButtonState,
}) => {
  const [audioDuration, setAudioDuration] = useState(0);

  const origAudioURL = audioResponse.url ?? null;

  useEffect(() => {
    if (origAudioURL) {
      const audio = new Audio(origAudioURL);
      audio.onloadedmetadata = () => {
        if (audio.duration === Infinity) {
          audio.addEventListener(
            'durationchange',
            function () {
              if (this.duration) {
                setAudioDuration(this.duration);
                audio.remove();
              }
            },
            false
          );
          audio.currentTime = 24 * 60 * 60;
          audio.volume = 0;
          audio.play();
        } else {
          setAudioDuration(audio.duration);
        }
      };
    }
  }, [origAudioURL, setAudioDuration]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        {origAudioURL && (
          <>
            <audio src={origAudioURL} controls />

            <TrimAudio
              audioResponse={audioResponse}
              setAudioResponse={setAudioResponse}
              audioDuration={audioDuration}
              maxDuration={maxDuration}
            />
          </>
        )}
      </div>

      {isTranscript ? (
        <LoadingButton
          onClick={saveRecording}
          buttonState={saveButtonState}
          text={'Save recording'}
          loadingText={'Saving ...'}
          successText="Saved"
          errorText="Error saving"
        />
      ) : (
        <Button
          className="bg-blue-600 rounded-lg text-white p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={audioDuration > maxDuration}
          onClick={transcribeRecording}
        >
          {transcriptionLoading
            ? 'Transcribing...'
            : audioDuration > maxDuration
              ? `Transcribe (max ${maxDuration} seconds)`
              : 'Transcribe'}
        </Button>
      )}
      <Button onClick={resetRecordingButtonState}>Reset</Button>
    </div>
  );
};

export default MediaReview;
