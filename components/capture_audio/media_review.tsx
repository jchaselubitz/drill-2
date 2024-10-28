import React, { useEffect, useState } from 'react';

interface MediaReviewProps {
  audioResponse: { blob: Blob; url: string };
  transcriptionLoading: boolean;
  transcribeRecording: () => Promise<void>;
  saveRecording: () => Promise<void>;
  resetRecordingButtonState: () => void;
  isTranscript: boolean;
}

const maxDuration = 120;

const MediaReview: React.FC<MediaReviewProps> = ({
  audioResponse,
  transcriptionLoading,
  transcribeRecording,
  saveRecording,
  resetRecordingButtonState,
  isTranscript,
}) => {
  const [audioDuration, setAudioDuration] = useState(0);
  const origAudioURL = audioResponse.url ?? null;

  useEffect(() => {
    if (origAudioURL) {
      loadAudioDuration();
    }
  }, [origAudioURL]);

  const loadAudioDuration = () => {
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
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        {origAudioURL && (
          <>
            <audio src={origAudioURL} controls />
            {/* Replace TrimAudio with appropriate React component */}
            {/* <TrimAudio audioResponse={audioResponse} audioDuration={audioDuration} maxDuration={maxDuration} /> */}
          </>
        )}
      </div>

      {isTranscript ? (
        <button onClick={saveRecording}>Save Recording</button>
      ) : (
        <button
          className="bg-blue-600 rounded-lg text-white p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={audioDuration > maxDuration}
          onClick={transcribeRecording}
        >
          {transcriptionLoading
            ? 'Transcribing...'
            : audioDuration > maxDuration
              ? `Transcribe (max ${maxDuration} minutes)`
              : 'Transcribe'}
        </button>
      )}
      <button onClick={resetRecordingButtonState}>Reset</button>
    </div>
  );
};

export default MediaReview;
