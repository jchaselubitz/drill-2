import React, { useEffect, useState } from 'react';

import { Button } from '../ui/button';
import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';
import TrimAudio from './trim_audio';

interface MediaReviewProps {
  audioResponse: { blob: Blob; url: string };
  setAudioResponse: (audioResponse: { blob: Blob; url: string }) => void;
  transcriptButtonState: ButtonLoadingState;
  transcribeRecording: () => Promise<void>;
  saveRecording: () => Promise<void>;
  saveTranscript: (fileName?: string) => Promise<void>;
  resetRecordingButtonState: () => void;
  isTranscript: boolean;
  saveButtonState: ButtonLoadingState;
  saveTranscriptButtonState: ButtonLoadingState;
}

const maxDuration = 241;
const maxDurationMinutes = Math.floor(maxDuration / 60);

const MediaReview: React.FC<MediaReviewProps> = ({
  audioResponse,
  setAudioResponse,
  transcriptButtonState,
  transcribeRecording,
  saveRecording,
  resetRecordingButtonState,
  isTranscript,
  saveButtonState,
  saveTranscript,
  saveTranscriptButtonState,
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
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 items-center">
        {origAudioURL && (
          <audio
            src={origAudioURL}
            controls
            style={{ border: '2px', borderRadius: '10px', width: '100%' }}
          />
        )}
      </div>
      <div className="flex  gap-2 items-center">
        {isTranscript ? (
          <>
            <LoadingButton
              className="w-full md:w-fit"
              onClick={saveRecording}
              buttonState={saveButtonState}
              text={'Save recording'}
              loadingText={'Saving ...'}
              successText="Saved"
              errorText="Error saving"
            />
            <LoadingButton
              className="w-full md:w-fit"
              onClick={() => saveTranscript()}
              buttonState={saveTranscriptButtonState}
              text={'Save text only'}
              loadingText={'Saving ...'}
              successText="Saved"
              errorText="Error saving"
            />
          </>
        ) : (
          <>
            <LoadingButton
              className=" md:w-fit bg-blue-600 rounded-lg text-white p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={audioDuration > maxDuration}
              onClick={transcribeRecording}
              buttonState={transcriptButtonState}
              text={
                audioDuration > maxDuration ? `Max ${maxDurationMinutes} minutes` : 'Transcribe'
              }
              loadingText="Transcribing..."
              successText="Transcribed"
              errorText="Error transcribing"
            />
            <TrimAudio
              audioResponse={audioResponse}
              setAudioResponse={setAudioResponse}
              audioDuration={audioDuration}
              maxDuration={maxDuration}
              maxDurationMinutes={maxDurationMinutes}
            />
          </>
        )}
        <Button className="w-full md:w-fit" onClick={resetRecordingButtonState}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default MediaReview;
